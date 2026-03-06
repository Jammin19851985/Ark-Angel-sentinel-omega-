
export enum OrderType {
    MARKET = "MARKET",
    LIMIT = "LIMIT"
}

export enum OrderStatus {
    FILLED = "FILLED",
    PARTIAL = "PARTIAL",
    REJECTED = "REJECTED",
    EXPIRED = "EXPIRED"
}

export enum Side {
    BUY = "BUY",
    SELL = "SELL"
}

export interface ShadowFill {
    order_id: string;
    status: OrderStatus;
    filled_qty: number;
    avg_price: number;
    slippage: number;
    fee: number;
    latency_ms: number;
    timestamp: number;
}

export class ShadowExecutionEngine {
    private latency_range: [number, number] = [25, 350];      // milliseconds
    private fee_rate = 0.0006;              // realistic taker fee
    private rejection_rate = 0.04;
    private partial_fill_rate = 0.18;
    private mode = "SHADOW_LIVE";

    constructor() {
        if (this.mode === "LIVE") {
            throw new Error("LIVE EXECUTION IS FORBIDDEN");
        }
    }

    async submit_order(
        side: Side,
        qty: number,
        market_price: number,
        order_type: OrderType = OrderType.MARKET
    ): Promise<ShadowFill> {
        const order_id = `ord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Simulate Network Latency
        const latency = Math.floor(Math.random() * (this.latency_range[1] - this.latency_range[0] + 1) + this.latency_range[0]);
        await new Promise(resolve => setTimeout(resolve, latency));

        // ---- REJECTION ----
        if (Math.random() < this.rejection_rate) {
            return {
                order_id,
                status: OrderStatus.REJECTED,
                filled_qty: 0.0,
                avg_price: 0.0,
                slippage: 0.0,
                fee: 0.0,
                latency_ms: latency,
                timestamp: Date.now()
            };
        }

        // ---- PARTIAL ----
        const is_partial = Math.random() < this.partial_fill_rate;
        const fill_ratio = is_partial ? (Math.random() * (0.85 - 0.3) + 0.3) : 1.0;
        const filled_qty = qty * fill_ratio;

        // ---- SLIPPAGE ----
        // random.uniform(-0.0008, 0.0016)
        const slip_pct = (Math.random() * (0.0016 - (-0.0008)) + (-0.0008));
        const slip = slip_pct * market_price;
        const fill_price = market_price + slip;

        // Fee
        const fee = filled_qty * fill_price * this.fee_rate;

        return {
            order_id,
            status: is_partial ? OrderStatus.PARTIAL : OrderStatus.FILLED,
            filled_qty,
            avg_price: fill_price,
            slippage: slip,
            fee,
            latency_ms: latency,
            timestamp: Date.now()
        };
    }
}
