// src/websockets/payment.gateway.ts

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({ namespace: '/payments', cors: { origin: '*' } })
export class PaymentGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(PaymentGateway.name);

  constructor(private readonly jwtService: JwtService, private readonly config: ConfigService) {}

  afterInit() {
    this.logger.log('Payment gateway initialized');
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

  // ==========================
  // 🔥 Emit funksiyalari
  // ==========================

  // To'liq to'lov amalga oshdi
  emitPaymentCompleted(savedPayment: any) {
    const { sessionId, branchId, userId, totalSum, items, paidBreakdown } =
      savedPayment;

    const payload = {
      sessionId,
      summary: { totalSum, items, paidBreakdown },
    };

    if (userId) this.server.to(`user:${userId}`).emit('payment.completed', payload);
    if (branchId)
      this.server.to(`branch:${branchId}`).emit('payment.completed', payload);

    // Global channel
    this.server.emit('payment.completed.global', payload);
  }

  // Qisman to'lov amalga oshdi
  emitPaymentPartial(savedPayment: any) {
    const { sessionId, branchId, userId, totalSum, items, paidBreakdown } =
      savedPayment;

    const payload = {
      sessionId,
      summary: { totalSum, items, paidBreakdown },
    };

    if (userId) this.server.to(`user:${userId}`).emit('payment.partial', payload);
    if (branchId)
      this.server.to(`branch:${branchId}`).emit('payment.partial', payload);

    this.server.emit('payment.partial.global', payload);
  }

  // Qarz yaratildi
emitDebtCreated(payload: { savedDebt: any; savedPayment: any }) {
  const { savedDebt, savedPayment } = payload;
  const { sessionId, branchId, userId } = savedPayment;

  const emitPayload = {
    sessionId,
    debt: savedDebt,
    payment: {
      totalSum: savedPayment.totalSum,
      items: savedPayment.items,
      paidBreakdown: savedPayment.paidBreakdown,
    },
  };

  if (userId) this.server.to(`user:${userId}`).emit('payment.debt-created', emitPayload);
  if (branchId) this.server.to(`branch:${branchId}`).emit('payment.debt-created', emitPayload);
  this.server.emit('payment.debt-created.global', emitPayload);
}

}
