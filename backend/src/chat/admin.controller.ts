import { Controller, Get, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin/metrics')
export class AdminController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Get('performance')
  async getPerformanceMetrics() {
    return this.chatService.getPerformanceMetrics();
  }

  @UseGuards(JwtAuthGuard)
  @Get('routing')
  async getRoutingMetrics() {
    return this.chatService.getRoutingMetrics();
  }
}
