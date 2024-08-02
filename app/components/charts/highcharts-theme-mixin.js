
export default Ember.Mixin.create({

  buildTheme: function() {
    Highcharts.theme = {
      chart: {
        style: { fontFamily: 'inherit', fontSize: 'inherit' }
      },
      title: {
        style: { fontSize: 'inherit', color: 'inherit' }
      },
      subtitle: {
        style: { fontSize: '14px' }
      },
      tooltip: {
        headerFormat: '<middle>{point.key}</middle><br>',
        style: { fontSize: '14px', color: 'inherit' }
      },
      legend: {
        itemStyle: {
          fontWeight: 'normal',
          fontSize: '15px',
          cursor: 'pointer',
          textOverflow: 'auto',
          color: 'inherit'
        }
      },
      exporting: {
        buttons: {
          contextButton: { enabled: false }
        }
      },
      xAxis: {
        labels: {
          style: { fontSize: '14px' }
        }
      },
      yAxis: {
        labels: {
          style: { textOverflow: 'auto', fontSize: 'inherit' }
        },
        title: {
          style: { fontSize: '14px' }
        }
      },
      plotOptions: {
        bar: {
          cursor: 'pointer',
          dataLabels: {
            formatter: function() {
              return (this.y !== 0) ? this.y : "";
            },
            style: { fontSize: 'inherit', color: 'inherit' }
          }
        },
        pie: {
          allowPointSelect: true,
          cursor: 'pointer',
          showInLegend: true,
          dataLabels: {
            enabled: true,
            style: {
              color: '#ffffff',
              fontSize: 'inherit',
              fontWeight: 'normal',
              textOverflow: 'auto'
            }
          },
          point: {
            events: {
              // this prevents disabling legend item when clicked
              legendItemClick: function(event) {
                  event.preventDefault();
              }
            },
          }
        }
      },
      responsive: {
        rules: [{
          condition: { maxWidth: 475 }, // chart width, not screen
          chartOptions: {
            legend: {
              itemStyle: { fontSize: '14px' }
            },
            subtitle: {
              style: { fontSize: '12.6px' }
            },
            yAxis: {
              title: {
                style: { fontSize: '12.6px' }
              }
            },
            plotOptions: {
              pie: {
                dataLabels: {
                  style: { fontSize: '12px' }
                }
              }
            }
          }
        }]
      }
    };
    return Highcharts.setOptions(Highcharts.theme);
  }
});
