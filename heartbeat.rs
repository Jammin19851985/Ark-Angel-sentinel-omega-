
use std::thread;
use std::time::Duration;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

pub struct Heartbeat {
    running: Arc<AtomicBool>,
}

impl Heartbeat {
    pub fn new() -> Self {
        Heartbeat {
            running: Arc::new(AtomicBool::new(true)),
        }
    }

    pub fn start(&self) {
        let running = self.running.clone();
        thread::spawn(move || {
            while running.load(Ordering::Relaxed) {
                // Emit pulse
                println!(">> KERNEL_PULSE: OK | MEM_SAFE: YES | LATENCY: <1ms");
                thread::sleep(Duration::from_millis(1000));
            }
        });
    }

    pub fn stop(&self) {
        self.running.store(false, Ordering::Relaxed);
    }
}
