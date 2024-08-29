export interface IQueryBuilderUser {
  users_id: number;
  users_created_at: Date;
  users_updated_at: Date;
  users_uid: string;
  users_name: string;
  users_email: string;
  users_status: string;
  users_coins: number;
  users_premiumCoins: number;
  users_subscription: number;
  users_level: number;
  users_points: number;
  users_tickets: number;
  users_avatar: string;
  users_statisticsId?: null;
  position: string;
}
