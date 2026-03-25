use anchor_lang::prelude::*;

declare_id!("Fg6Pa4upv2q67wm7K7t2JdKs99m8CidpU3S27K6dL2eX");

#[program]
pub mod clashgo {
    use super::*;

    pub fn initialize_player(ctx: Context<InitializePlayer>) -> Result<()> {
        let player_stats = &mut ctx.accounts.player_stats;
        player_stats.authority = *ctx.accounts.user.key;
        player_stats.xp = 0;
        player_stats.skr_balance = 100; // Starting bonus for hackathon demo
        player_stats.win_streak = 0;
        Ok(())
    }

    pub fn settle_match(
        ctx: Context<SettleMatch>, 
        xp_reward: u64, 
        skr_yield: i64, 
        is_win: bool
    ) -> Result<()> {
        let player_stats = &mut ctx.accounts.player_stats;
        
        // Update XP
        player_stats.xp = player_stats.xp.checked_add(xp_reward).unwrap();
        
        // Update SKR Balance (can be positive or negative)
        let new_balance = player_stats.skr_balance as i64 + skr_yield;
        player_stats.skr_balance = if new_balance < 0 { 0 } else { new_balance as u64 };
        
        // Update Win Streak
        if is_win {
            player_stats.win_streak += 1;
        } else {
            player_stats.win_streak = 0;
        }
        
        Ok(())
    }
}

#[derive(Accounts)]
pub Albright InitializePlayer<'info> {
    #[account(init, payer = user, space = 8 + 32 + 8 + 8 + 8, seeds = [b"player_stats", user.key().as_ref()], bump)]
    pub player_stats: Account<'info, PlayerStats>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SettleMatch<'info> {
    #[account(mut, seeds = [b"player_stats", user.key().as_ref()], bump)]
    pub player_stats: Account<'info, PlayerStats>,
    #[account(mut)]
    pub user: Signer<'info>,
}

#[account]
pub struct PlayerStats {
    pub authority: Pubkey,
    pub xp: u64,
    pub skr_balance: u64,
    pub win_streak: u64,
}
