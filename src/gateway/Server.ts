import "missing-native-js-functions";
import dotenv from "dotenv";
dotenv.config();
import {
	closeDatabase,
	Config,
	initDatabase,
	initEvent,
	Sentry,
} from "@spacebar/util";
import ws from "ws";
import { Connection } from "./events/Connection";
import http from "http";
import { setupVoiceSignaling } from "./websocket/voice";

export class Server {
	public ws: ws.Server;
	public voiceWs: ws.Server; // Added for voice signaling
	public port: number;
	public server: http.Server;
	public production: boolean;

	constructor({
		port,
		server,
		production,
	}: {
		port: number;
		server?: http.Server;
		production?: boolean;
	}) {
		this.port = port;
		this.production = production || false;

		if (server) this.server = server;
		else {
			this.server = http.createServer(function (req, res) {
				res.writeHead(200).end("Online");
			});
		}

		// Handle WebSocket upgrades for both gateway and voice
		this.server.on("upgrade", (request, socket, head) => {
			const url = new URL(request.url || "", `http://${request.headers.host}`);
			if (url.pathname === "/voice") {
				this.voiceWs.handleUpgrade(request, socket, head, (socket) => {
					this.voiceWs.emit("connection", socket, request);
				});
			} else {
				this.ws.handleUpgrade(request, socket, head, (socket) => {
					this.ws.emit("connection", socket, request);
				});
			}
		});

		// Gateway WebSocket server
		this.ws = new ws.Server({
			maxPayload: 4096,
			noServer: true,
		});
		this.ws.on("connection", Connection);
		this.ws.on("error", console.error);

		// Voice WebSocket server
		this.voiceWs = new ws.Server({
			maxPayload: 4096,
			noServer: true,
		});
		setupVoiceSignaling(this.voiceWs); // Initialize voice signaling
	}

	async start(): Promise<void> {
		await initDatabase();
		await Config.init();
		await initEvent();
		await Sentry.init();

		if (!this.server.listening) {
			this.server.listen(this.port);
			console.log(`[Gateway] online on 0.0.0.0:${this.port}`);
			console.log(`[Voice] online on 0.0.0.0:${this.port}/voice`);
		}
	}

	async stop() {
		this.ws.clients.forEach((x) => x.close());
		this.voiceWs.clients.forEach((x) => x.close()); // Close voice clients
		this.ws.close(() => {
			this.voiceWs.close(() => {
				this.server.close(() => {
					closeDatabase();
				});
			});
		});
	}
}
