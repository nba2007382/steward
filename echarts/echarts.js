const echarts = require('echarts');
const { createCanvas } = require('canvas');

function getChartImg(data) {
  // 创建一个 ECharts 实例
  const canvas = createCanvas(800, 600);
  const chart = echarts.init(canvas);
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
          data: data.time.map((el) =>
              new Date(parseInt(el)).toDateString(),
          ),
      },
      yAxis: {
          type: 'value',
      },
      series: [
          {
              data: data.price.map(parseFloat),
              type: 'line',
              smooth: true,
          },
      ],
  };
  // 设置图表的选项
  chart.setOption(option);
  return canvas.toDataURL();
}

module.exports = { getChartImg };
