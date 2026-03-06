
use std::time::{Instant, Duration};
use std::sync::Mutex;

pub struct RateLimiter {
    tokens: Mutex<f64>,
    max_tokens: f64,
    refill_rate: f64, // tokens per second
    last_refill: Mutex<Instant>,
}

impl RateLimiter {
    pub fn new(max_tokens: f64, refill_rate: f64) -> Self {
        RateLimiter {
            tokens: Mutex::new(max_tokens),
            max_tokens,
            refill_rate,
            last_refill: Mutex::new(Instant::now()),
        }
    }

    pub fn check(&self, cost: f64) -> bool {
        let mut tokens = self.tokens.lock().unwrap();
        let mut last_refill = self.last_refill.lock().unwrap();
        
        let now = Instant::now();
        let elapsed = now.duration_since(*last_refill).as_secs_f64();
        
        // Refill
        *tokens = (*tokens + elapsed * self.refill_rate).min(self.max_tokens);
        *last_refill = now;

        if *tokens >= cost {
            *tokens -= cost;
            true
        } else {
            false
        }
    }
}
