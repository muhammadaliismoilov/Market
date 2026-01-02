import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
// TO'G'RILANDI: Ishlatilmagan log import o'chirildi

@WebSocketGateway({ namespace: '/transactions', cors: { origin: '*' } })
export class TransactionsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(TransactionsGateway.name);

  constructor(private readonly jwtService: JwtService, private readonly config: ConfigService) {}

  afterInit() {
    this.logger.log('Transactions gateway initialized');
  }

  async handleConnection(socket: Socket) {
    try {
      // client should send token in handshake auth: { token }
      const token = (socket.handshake.auth && socket.handshake.auth.token) || socket.handshake.query?.token;
      if (!token) throw new Error('No token');

      // TO'G'RILANDI: Default secret olib tashlandi, .env da bo'lishi shart
      const jwtSecret = this.config.get<string>('JWT_SECRET');
      if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable sozlanmagan');
      }

      const payload: any = await this.jwtService.verifyAsync(String(token), {
        secret: jwtSecret,
      });
  

      // attach user to socket
      socket.data.user = payload;
      // join rooms: user and branch (if present)
      socket.join(`user:${payload.userId}`);
      if (payload.branchId) socket.join(`branch:${payload.branchId}`);

      this.logger.log(`Socket connected: ${socket.id} user:${payload.userId}`);
    } catch (err) {
      this.logger.warn(`Socket auth failed: ${err.message}`);
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Socket disconnected: ${socket.id}`);
  }

  // emit helpers
  emitSessionUpdated(sessionId: string, branchId: string, userId: string, totals: any, item: any) {
    const payload = { sessionId, totals, item };
    // emit to cashier and branch rooms and global
    if (userId) this.server.to(`user:${userId}`).emit('session.updated', payload);
    if (branchId) this.server.to(`branch:${branchId}`).emit('session.updated', payload);
    this.server.emit('session.updated.global', payload);
  }

  emitSessionCompleted(sessionId: string, branchId: string, userId: string, summary: any) {
    const payload = { sessionId, summary };
    if (userId) this.server.to(`user:${userId}`).emit('session.completed', payload);
    if (branchId) this.server.to(`branch:${branchId}`).emit('session.completed', payload);
    this.server.emit('session.completed.global', payload);
  }

  emitTransactionReturned(returnTx: any, branchId: string, userId: string) {
    const payload = { returnTx };
    if (userId) this.server.to(`user:${userId}`).emit('transaction.returned', payload);
    if (branchId) this.server.to(`branch:${branchId}`).emit('transaction.returned', payload);
    this.server.emit('transaction.returned.global', payload);
  }
}