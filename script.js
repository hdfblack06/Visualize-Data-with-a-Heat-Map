function GetChart() {
  const width = 1200;
  const height = 500;
  const chartHolder = d3
    .select("#chartHolder")
    .append("svg")
    .attr("id", "svgHolder")
    .attr("width", width + 90)
    .attr("height", height + 35);
  const chartHelper = d3
    .select("#chartHelper")
    .append("svg")
    .attr("id", "svgHelper")
    .attr("width", 700)
    .attr("height", 85);

  const tooltip = d3
    .select("#chartHolder")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);
  const JsonData =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
  fetch(JsonData)
    .then((response) => response.json())
    .then((data) => {
      const baseTemp = data.baseTemperature;
      const varianceTemp = data.monthlyVariance.map((d) => {
        return d.variance;
      });
      const temperatureColors = [
        "#E6F2F8",
        "#C1E2F1",
        "#A2DCE8",
        "#7DC6D5",
        "#52AED8",
        "#3297DB",
        "#187FC7",
        "#08519C",
        "#08306B",
      ];
      //create x-axis
      const year = data.monthlyVariance.map((d) => {
        return d.year;
      });
      const startYear = d3.min(year);
      const endYear = d3.max(year);
      const xScale = d3
        .scaleLinear()
        .domain([startYear, endYear + 1])
        .range([0, width]);
      const xAxis = d3
        .axisBottom(xScale)
        .tickValues(d3.range(startYear, endYear, 10))
        .tickFormat(d3.format("d"));
      chartHolder
        .append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(80, ${height / 2 + 235.5})`)
        .style("font-size", "small")
        .call(xAxis)
        .append("text")
        .text("YEARS")
        .style("fill", "#FCFAFA")
        .style("font-size", "x-large")
        .style("text-anchor", "middle")
        .attr("transform", `translate(${width / 2}, 45)`);
      //create y-axis
      const monthNumber = data.monthlyVariance.map((d) => {
        return d.month;
      });
      const startMonth = d3.min(monthNumber);
      const endMonth = d3.max(monthNumber);
      const yScale = d3
        .scaleLinear()
        .domain([startMonth - 1, endMonth - 1])
        .range([0, height - 60]);
      const yAxis = d3.axisLeft(yScale).tickFormat((monthNB) => {
        const date = new Date(2023, monthNB, 1);
        return d3.timeFormat("%B")(date);
      });
      chartHolder
        .append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(80,5)`)
        .style("font-size", "small")
        .call(yAxis)
        .append("text")
        .text("MONTHS")
        .style("fill", "#FCFAFA")
        .style("font-size", "x-large")
        .style("text-anchor", "middle")
        .attr("transform", `translate(-60, ${height / 2 - 50}) rotate(-90)`);
      //
      const rect = d3
        .select("#svgHolder")
        .selectAll(".cell")
        .data(data.monthlyVariance)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("data-month", (d) => {
          return d.month - 1;
        })
        .attr("data-year", (d) => {
          return d.year;
        })
        .attr("data-temp", (d) => {
          return d.variance + baseTemp;
        })
        .attr("x", (d) => {
          return xScale(d.year);
        })
        .attr("y", (d) => {
          return yScale(d.month) - 1;
        })
        .attr("height", 41)
        .attr("width", 5)
        .attr("transform", "translate(80,-34)")
        .style("fill", (d) => {
          let varianceTemp = d.variance + baseTemp;
          switch (true) {
            case varianceTemp <= 3.1:
              return temperatureColors[0];
            case varianceTemp <= 4.4:
              return temperatureColors[1];
            case varianceTemp <= 5.8:
              return temperatureColors[2];
            case varianceTemp <= 7.1:
              return temperatureColors[3];
            case varianceTemp <= 8.5:
              return temperatureColors[4];
            case varianceTemp <= 9.8:
              return temperatureColors[5];
            case varianceTemp <= 11.2:
              return temperatureColors[6];
            case varianceTemp <= 12.5:
              return temperatureColors[7];
            case varianceTemp <= 13.9:
              return temperatureColors[8];
            default:
              break;
          }
        })
        .on("mouseover", (event, d) => {
          let date = d3.utcFormat("%Y - %B")(new Date(d.year, d.month));
          let varianceTemp = d3.format(".1f")(
            data.baseTemperature + d.variance
          );
          let variance = d3.format("+.1f")(d.variance);
          tooltip
            .attr("data-year", d.year)
            .style("opacity", 0.9)
            .html(`${date}<br>${varianceTemp}<br>${variance}`)
            .style("left", `${event.pageX - 70}px`)
            .style("top", `${event.pageY - 120}px`);
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
          tooltip.style("left", `0px`);
          tooltip.style("top", `0px`);
        });
      //legend
      //create x-axis
      const minVarianceTemp = d3.min(varianceTemp);
      const maxVarianceTemp = d3.max(varianceTemp);
      const totalMinVarianceTemp = minVarianceTemp + baseTemp;
      const totalMaxVarianceTemp = maxVarianceTemp + baseTemp;
      const xScaleLegend = d3
        .scaleLinear()
        .domain([
          totalMinVarianceTemp.toFixed(1),
          totalMaxVarianceTemp.toFixed(1),
        ])
        .range([0, 400]);
      const xAxisLegend = d3
        .axisBottom(xScaleLegend)
        .tickValues(
          d3.range(
            totalMinVarianceTemp.toFixed(1),
            totalMaxVarianceTemp.toFixed(1),
            1.355
          )
        )
        .tickFormat(d3.format(".1f"));
      chartHelper
        .append("g")
        .attr("id", "legend")
        .attr("transform", "translate(150,60)")
        .style("font-size", "small")
        .call(xAxisLegend);
      const rectLegend = d3
        .select("#legend")
        .selectAll("rect")
        .data(temperatureColors)
        .enter()
        .append("rect")
        .attr("width", 45)
        .attr("height", 35)
        .attr("x", (d, i) => {
          return xScaleLegend(
            d3.range(
              totalMinVarianceTemp.toFixed(1),
              totalMaxVarianceTemp.toFixed(1),
              1.355
            )[i]
          );
        })
        .attr("transform", `translate(0,-35)`)
        .style("fill", (d) => {
          return d;
        });
    })
    .catch((err) => console.error(err));
}
