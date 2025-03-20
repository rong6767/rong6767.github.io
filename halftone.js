(function (global) {
    /**
     * 将图像转换为保留色彩的 halftone 风格
     * @param {HTMLImageElement} img - 已加载完成的图片元素
     * @param {Object} options - 可选参数
     *   @property {number} [cellSize=10] - 每个网格单元的边长，决定颗粒大小
     *   @property {string} [bgColor='white'] - 背景颜色
     *   @property {string} [customDotColor] - 自定义圆点颜色，如果提供，将覆盖原始颜色
     * @returns {HTMLCanvasElement} 转换后的 canvas 元素
     */
    function halftoneEffectColor(img, options) {
      options = options || {};
      var cellSize = options.cellSize || 10;
      var bgColor = options.bgColor || 'white';
      var customDotColor = options.customDotColor;
  
      var width = img.naturalWidth || img.width;
      var height = img.naturalHeight || img.height;
  
      // 创建 canvas 并设置尺寸与图片一致
      var canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      // 设置样式确保居中显示
      canvas.style.maxWidth = '100%';
      canvas.style.height = 'auto';
      canvas.style.display = 'block';
      canvas.style.margin = '0 auto';
      
      var ctx = canvas.getContext('2d');
  
      // 将原图绘制到 canvas 上
      ctx.drawImage(img, 0, 0, width, height);
  
      // 获取图像数据以便处理
      var imageData = ctx.getImageData(0, 0, width, height);
      var data = imageData.data;
  
      // 填充背景色
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
  
      // 遍历图像，将图像分成 cellSize 大小的网格
      for (var y = 0; y < height; y += cellSize) {
        for (var x = 0; x < width; x += cellSize) {
          var rSum = 0, gSum = 0, bSum = 0, sum = 0;
          var count = 0;
          // 遍历网格单元内的像素，计算平均颜色和亮度
          for (var j = 0; j < cellSize; j++) {
            for (var i = 0; i < cellSize; i++) {
              var px = x + i;
              var py = y + j;
              if (px < width && py < height) {
                var idx = (py * width + px) * 4;
                var r = data[idx];
                var g = data[idx + 1];
                var b = data[idx + 2];
                // 使用加权公式计算亮度
                var luminance = 0.299 * r + 0.587 * g + 0.114 * b;
                sum += luminance;
                rSum += r;
                gSum += g;
                bSum += b;
                count++;
              }
            }
          }
          // 计算平均亮度和平均颜色
          var avgLuminance = sum / count;
          var avgR = Math.round(rSum / count);
          var avgG = Math.round(gSum / count);
          var avgB = Math.round(bSum / count);
  
          // 根据平均亮度决定圆点半径（亮度越低，圆点越大）
          var ratio = 1 - avgLuminance / 255;
          var radius = ratio * (cellSize / 2);
  
          // 使用平均颜色或自定义颜色填充圆点
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, radius, 0, Math.PI * 2);
          
          if (customDotColor) {
            ctx.fillStyle = customDotColor;
          } else {
            ctx.fillStyle = 'rgb(' + avgR + ',' + avgG + ',' + avgB + ')';
          }
          
          ctx.fill();
        }
      }
  
      return canvas;
    }
  
    // 暴露全局变量
    global.halftoneEffectColor = halftoneEffectColor;
  })(window);
  