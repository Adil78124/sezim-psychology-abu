export default async (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ 
      ok: true, 
      message: 'Test API works!',
      timestamp: new Date().toISOString(),
      method: req.method
    });
  } catch (error) {
    res.status(500).json({ 
      ok: false, 
      error: error.message,
      stack: error.stack 
    });
  }
};
