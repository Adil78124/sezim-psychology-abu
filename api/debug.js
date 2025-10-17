export default (req, res) => {
  res.status(200).json({
    message: 'Debug endpoint works!',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url
  });
};
