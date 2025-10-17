export default (req, res) => {
  try {
    res.status(200).json({
      message: 'Environment variables test',
      hasToken: !!process.env.TELEGRAM_BOT_TOKEN,
      hasChatId: !!process.env.TELEGRAM_CHAT_ID,
      tokenLength: process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.length : 0,
      chatId: process.env.TELEGRAM_CHAT_ID || 'not found',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: 'Error in env-test'
    });
  }
};
