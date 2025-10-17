export default (req, res) => {
  try {
    res.status(200).json({
      message: 'Simple Telegram test endpoint',
      hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
      hasChatId: !!process.env.TELEGRAM_CHAT_ID,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Error in simple-telegram'
    });
  }
};
