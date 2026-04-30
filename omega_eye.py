
import streamlit as st
import plotly.graph_objects as go
import yfinance as yf
import pandas as pd
import time

st.set_page_config(page_title="ARCHANGEL FUSION // COMMAND", layout="wide", page_icon="⚡")

st.markdown("""
<style>
    .stApp { background-color: #000000; color: #00FF00; }
    .metric-card { border: 1px solid #333; padding: 10px; border-radius: 5px; }
</style>
""", unsafe_allow_html=True)

st.title("⚡ ARCHANGEL FUSION COMMAND DECK")

# --- SIDEBAR CONTROLS ---
st.sidebar.header("REALITY CONTROLS")
if st.sidebar.button("🔊 TRANSMIT: 'FLY'"):
    st.sidebar.warning("COMMAND SENT: GRAVITY_NULLIFICATION")
if st.sidebar.button("🔊 TRANSMIT: 'HEAL'"):
    st.sidebar.success("COMMAND SENT: BIO_REGEN_SEQUENCE")

st.sidebar.markdown("---")
target = st.sidebar.selectbox("MARKET FEED", ["BTC-USD", "ETH-USD", "RY.TO", "TD.TO"])

# --- LIVE METRICS ---
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("SWARM AGENTS", "2,500", "ACTIVE")
with col2:
    st.metric("NEURAL ACCURACY", "98.7%", "+0.2%")
with col3:
    st.metric("TAXABLE GAINS (CAD)", "$12,450.00", "LOGGED")
with col4:
    st.metric("REALITY FREQUENCY", "1.01e41 Hz", "STABLE")

# --- LIVE CHART ---
st.subheader(f"LIVE VISUAL: {target}")
data = yf.download(target, period="1d", interval="5m", progress=False)

if not data.empty:
    fig = go.Figure(data=[go.Candlestick(x=data.index,
                    open=data['Open'],
                    high=data['High'],
                    low=data['Low'],
                    close=data['Close'],
                    increasing_line_color='#00FF00', decreasing_line_color='#FF0000')])
    fig.update_layout(xaxis_rangeslider_visible=False, paper_bgcolor='rgba(0,0,0,0)', plot_bgcolor='rgba(0,0,0,0)', font=dict(color="white"))
    st.plotly_chart(fig, use_container_width=True)
else:
    st.warning("FETCHING SATELLITE DATA...")

time.sleep(2)
st.rerun()
