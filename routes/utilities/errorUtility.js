class ErrorUtility {
    static logError(status, err, res){
      console.error(err.message);
        res.status(status).json({
          error: err.message,
        });
  }
}

module.exports = ErrorUtility;