const echarts = require('echarts');


function getChartImg(data) {
  // 创建一个 ECharts 实例
  const chart = echarts.init(dom, null, {renderer: 'svg'});

  // 设置图表的配置项和数据
  const option = {
      title: {
          text: '商品价格变动',
      },
      tooltip: {
          trigger: 'axis',
      },
      xAxis: {
          type: 'category',
          data: data.value.time.map((el) =>
              new Date(parseInt(el)).toDateString(),
          ),
      },
      yAxis: {
          type: 'value',
      },
      series: [
          {
              data: data.value.price.map(parseFloat),
              type: 'line',
              smooth: true,
          },
      ],
  };

  // 设置图表的选项
  chart.setOption(option);

  // 获取图表的 base64 编码的图片数据
  const imageData = chart.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  });

  return imageData;
}

module.exports = { getChartImg };
