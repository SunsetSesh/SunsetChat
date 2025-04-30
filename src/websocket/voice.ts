import { WebSocketServer, WebSocket } from 'ws';
  import { User } from '../entities/User'; // Adjust based on Spacebar's entity structure
  import { Channel } from '../entities/Channel'; // Adjust based on Spacebar's entity structure

  interface VoiceSignal {
    type: 'offer' | 'answer' | 'ice';
    channelId: string;
    senderId: string;
    recipientId: string;
    data: any; // SDP or ICE candidate
  }

  export function setupVoiceSignaling(wss: WebSocketServer) {
    const voiceConnections: Map<string, WebSocket> = new Map(); // Track user WebSocket connections

    wss.on('connection', (ws: WebSocket, req) => {
      // Authenticate user (Spacebar likely has auth middleware)
      const userId = req.headers['user-id'] as string; // Adjust based on Spacebar's auth
      if (!userId) {
        ws.close(4001, 'Unauthorized');
        return;
      }
      voiceConnections.set(userId, ws);

      ws.on('message', async (message: string) => {
        try {
          const signal: VoiceSignal = JSON.parse(message);
          const { type, channelId, senderId, recipientId, data } = signal;

          // Validate channel and permissions
          const channel = await Channel.findOne({ id: channelId });
          if (!channel) {
            ws.send(JSON.stringify({ error: 'Invalid channel' }));
            return;
          }

          // Route signaling messages
          const recipientWs = voiceConnections.get(recipientId);
          if (recipientWs) {
            recipientWs.send(JSON.stringify({
              event: `VOICE_SIGNAL_${type.toUpperCase()}`,
              data: { senderId, channelId, data }
            }));
          }
        } catch (error) {
          ws.send(JSON.stringify({ error: 'Invalid signal' }));
        }
      });

      ws.on('close', () => {
        voiceConnections.delete(userId);
      });
    });
  }
