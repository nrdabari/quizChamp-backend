const fs = require('fs');
const path = require('path');

exports.deleteImageFile = (relativePath) => {
  const fullPath = path.join(__dirname, '..', relativePath);

  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
      console.log(`🗑️ Deleted file: ${relativePath}`);
      return true;
    } catch (err) {
      console.error('❌ Error deleting file:', err);
      return false;
    }
  } else {
    console.warn('⚠️ File not found:', fullPath);
    return false;
  }
};
