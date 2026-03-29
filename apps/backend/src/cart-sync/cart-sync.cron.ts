import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CartSyncService } from './cart-sync.service';

@Injectable()
export class CartSyncCron {
  private readonly logger = new Logger(CartSyncCron.name);

  constructor(private readonly cartSyncService: CartSyncService) {}

  /**
   * Sync dirty carts every 2 minutes
   */
  @Cron('*/2 * * * *')
  async handleCron() {
    this.logger.debug('Starting cart sync cron job');
    
    try {
      const result = await this.cartSyncService.syncDirtyCarts();
      
      if (result.synced > 0 || result.failed > 0) {
        this.logger.log(`Cart sync completed: ${result.synced} synced, ${result.failed} failed`);
      } else {
        this.logger.debug('No carts needed syncing');
      }
    } catch (error) {
      this.logger.error('Cart sync cron job failed', error);
    }
  }
}
