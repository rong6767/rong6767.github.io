(function (global) {
  /**
   * 创建带有半调效果的文本
   * @param {string} text - 要显示的文本
   * @param {Object} options - 可选参数
   *   @property {number} [width=400] - canvas宽度
   *   @property {number} [height=100] - canvas高度
   *   @property {number} [cellSize=4] - 半调网格大小
   *   @property {string} [color='black'] - 文本颜色
   *   @property {string} [bgColor='transparent'] - 背景颜色
   *   @property {string} [fontFamily='Village-wLn3'] - 字体
   *   @property {number} [fontSize=80] - 字体大小(px)
   * @returns {HTMLCanvasElement} 转换后的 canvas 元素
   */
  function createHalftoneText(text, options) {
    options = options || {};
    var width = options.width || 400;
    var height = options.height || 100;
    var cellSize = options.cellSize || 4;
    var color = options.color || 'black';
    var bgColor = options.bgColor || 'transparent';
    var fontFamily = options.fontFamily || 'Village-wLn3';
    var fontSize = options.fontSize || 80;

    // 创建临时 canvas 用于渲染文本
    var tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    var tempCtx = tempCanvas.getContext('2d');

    // 设置文本样式并绘制文本
    tempCtx.fillStyle = color;
    tempCtx.font = `bold ${fontSize}px ${fontFamily}`;
    tempCtx.textAlign = 'center';
    tempCtx.textBaseline = 'middle';
    tempCtx.fillText(text, width / 2, height / 2);

    // 再绘制一次增强效果
    tempCtx.fillText(text, width / 2, height / 2);

    // 获取临时 canvas 上的图像数据
    var imageData = tempCtx.getImageData(0, 0, width, height);
    var data = imageData.data;

    // 创建半调效果 canvas
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    canvas.style.pointerEvents = 'none'; // 确保不会拦截点击事件
    
    var ctx = canvas.getContext('2d');

    // 设置背景颜色（默认透明）
    if (bgColor !== 'transparent') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    // 遍历图像，将图像分成 cellSize 大小的网格
    for (var y = 0; y < height; y += cellSize) {
      for (var x = 0; x < width; x += cellSize) {
        var sum = 0;
        var count = 0;
        
        // 遍历网格单元内的像素，计算平均亮度
        for (var j = 0; j < cellSize; j++) {
          for (var i = 0; i < cellSize; i++) {
            var px = x + i;
            var py = y + j;
            if (px < width && py < height) {
              var idx = (py * width + px) * 4;
              // 只检查 alpha 通道，因为我们只关心文本
              var alpha = data[idx + 3];
              sum += alpha;
              count++;
            }
          }
        }
        
        // 计算平均亮度
        var avgAlpha = sum / count;

        // 只对有文本的区域绘制圆点，降低阈值以显示更多的点
        if (avgAlpha > 30) {  // 检查平均透明度，只在有文字的地方绘制
          // 根据平均亮度决定圆点半径（亮度越高，圆点越大）
          var radius = (avgAlpha / 255) * (cellSize / 1.8); // 调整计算方式使圆点更大
          
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, radius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }
    }

    return canvas;
  }

  // 暴露全局变量
  global.createHalftoneText = createHalftoneText;
})(window); 