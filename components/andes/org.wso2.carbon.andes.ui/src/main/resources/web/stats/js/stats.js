            function drawChart() {
                // document.getElementById("test").innerHTML = JSON.stringify(chartData);
                text = "";
				var i;
				for (i = 0; i < chartData.length; i++) {
					var ddd = chartData[i].date;
				    text += ddd + "<br>";
				}

                // SERIAL CHART
                chart = new AmCharts.AmSerialChart();
                chart.pathToImages = "js/amcharts/images/";
                chart.dataProvider = chartData;
                chart.categoryField = "Date";
                chart.balloon.bulletSize = 5;

                // listen for "dataUpdated" event (fired when chart is rendered) and call zoomChart method when it happens
                chart.addListener("dataUpdated", zoomChart);

                // AXES
                // category
                var categoryAxis = chart.categoryAxis;
                categoryAxis.parseDates = true; // as our data is date-based, we set parseDates to true
                categoryAxis.minPeriod = "ss"; // our data is daily, so we set minPeriod to DD
                categoryAxis.dashLength = 1;
                categoryAxis.minorGridEnabled = true;
                categoryAxis.twoLineMode = true;
                categoryAxis.dateFormats = [{
                    period: 'fff',
                    format: 'JJ:NN:SS'
                }, {
                    period: 'ss',
                    format: 'JJ:NN:SS'
                }, {
                    period: 'mm',
                    format: 'JJ:NN'
                }, {
                    period: 'hh',
                    format: 'JJ:NN'
                }, {
                    period: 'DD',
                    format: 'DD'
                }, {
                    period: 'WW',
                    format: 'DD'
                }, {
                    period: 'MM',
                    format: 'MMM'
                }, {
                    period: 'YYYY',
                    format: 'YYYY'
                }];

                categoryAxis.axisColor = "#DADADA";

                // value
                var valueAxis = new AmCharts.ValueAxis();
                valueAxis.axisAlpha = 0;
                valueAxis.dashLength = 1;
                valueAxis.title = "Message Rate (messages/s)"
                chart.addValueAxis(valueAxis);

                // PUBLISH GRAPH
                publishGraph = new AmCharts.AmGraph();
                publishGraph.title = "Message Published Rate";
                publishGraph.valueField = "RatePublished";
                publishGraph.bullet = "round";
                publishGraph.bulletBorderColor = "#FFFFFF";
                publishGraph.bulletBorderThickness = 2;
                publishGraph.bulletBorderAlpha = 1;
                publishGraph.lineThickness = 2;
                publishGraph.lineColor = "#5fb503";
                publishGraph.negativeLineColor = "#efcc26";
                publishGraph.hideBulletsCount = 50; // this makes the chart to hide bullets when there are more than 50 series in selection
//                publishGraph.balloonText = "[[RatePublishCounter]]";
                chart.addGraph(publishGraph);

                // DELIVER GRAPH
                deliverGraph = new AmCharts.AmGraph();
                deliverGraph.title = "Message Deliver Rate";
                deliverGraph.valueField = "RateDelivered";
                deliverGraph.bullet = "round";
                deliverGraph.bulletBorderColor = "#FFFFFF";
                deliverGraph.bulletBorderThickness = 2;
                deliverGraph.bulletBorderAlpha = 1;
                deliverGraph.lineThickness = 2;
                deliverGraph.lineColor = "#FFA500";
                deliverGraph.negativeLineColor = "#efcc26";
                deliverGraph.hideBulletsCount = 50; // this makes the chart to hide bullets when there are more than 50 series in selection
//                deliverGraph.balloonText = "[[RateDeliverCounter]]";

                // ACKNOWLEDGED GRAPH
                acknowledgedGraph = new AmCharts.AmGraph();
                acknowledgedGraph.title = "Message Acknowledged Rate";
                acknowledgedGraph.valueField = "RateAcknowledged";
                acknowledgedGraph.bullet = "round";
                acknowledgedGraph.bulletBorderColor = "#FFFFFF";
                acknowledgedGraph.bulletBorderThickness = 2;
                acknowledgedGraph.bulletBorderAlpha = 1;
                acknowledgedGraph.lineThickness = 2;
                acknowledgedGraph.lineColor = "#00FFFF";
                acknowledgedGraph.negativeLineColor = "#efcc26";
                acknowledgedGraph.hideBulletsCount = 50; // this makes the chart to hide bullets when there are more than 50 series in selection
//                acknowledgedGraph.balloonText = "[[RateAcknowledgedCounter]]";



                // CURSOR
                chartCursor = new AmCharts.ChartCursor();
                chartCursor.cursorPosition = "mouse";
                chartCursor.pan = true; // set it to fals if you want the cursor to work in "select" mode
                chartCursor.valueBalloonsEnabled = true;
                chartCursor.categoryBalloonDateFormat = "H:N:SS MMM DD, YYYY";
                chart.addChartCursor(chartCursor);

                // SCROLLBAR
                var chartScrollbar = new AmCharts.ChartScrollbar();
                chart.addChartScrollbar(chartScrollbar);

                chart.creditsPosition = "bottom-right";

                // WRITE
                chart.write("chartdiv");
            }

            // this method is called when chart is first inited as we listen for "dataUpdated" event
            function zoomChart() {
                // different zoom methods can be used - zoomToIndexes, zoomToDates, zoomToCategoryValues
                chart.zoomToIndexes(-10, chartData.length + 10);
            }

            // changes cursor mode from pan to select
            function setPanSelect() {
                if (document.getElementById("rb1").checked) {
                    chartCursor.pan = false;
                    chartCursor.zoomable = true;
                } else {
                    chartCursor.pan = true;
                }
                chart.validateNow();
            }

            // Change session queue variable on queueSelect
            function setRateQueueName() {
                var selectList = document.getElementById("queueSelect");
                var selectedQueue = selectList.options[selectList.selectedIndex].value;
                var callback =
                {
                    success:function(o) {
                        document.getElementById("test").innerHTML = JSON.stringify(o.responseText);
                    },
                    failure:function(o) {
                        if (o.responseText !== undefined) {
                            alert("Error " + o.status + "\n Following is the message from the server.\n" + o.responseText);
                        }
                    }
                };
                var request = YAHOO.util.Connect.asyncRequest('POST', "set_current_queue_ajaxprocessor.jsp", callback, "selectedQueue=" + selectedQueue + "&type=input");
            }

            // Change session queue variable on queueSelect
            function loadGraphData() {
                var queueSelectList = document.getElementById("queueSelect");
                var selectedQueue = queueSelectList.options[queueSelectList.selectedIndex].value;
                var durationSelectList = document.getElementById("durationSelect");
                var selectedDuration = durationSelectList.options[durationSelectList.selectedIndex].value;
                var callback =
                {
                    success:function(o) {
                       chartData = JSON.parse(o.responseText);
                       drawChart();
                       document.getElementById("publishCheck").checked = true;
                       document.getElementById("deliverCheck").checked = false;
                       document.getElementById("ackCheck").checked = false;
                    },
                    failure:function(o) {
                        if (o.responseText !== undefined) {
                            alert("Error " + o.status + "\n Following is the message from the server.\n" + o.responseText);
                        }
                    }
                };
                var request = YAHOO.util.Connect.asyncRequest('POST', "load_graph_data_ajaxprocessor.jsp", callback, "selectedQueue=" + selectedQueue + "&selectedDuration=" + selectedDuration + "&type=input");
            }

            function addRemovePublishData() {
                             if (document.getElementById("publishCheck").checked){
                                                    chart.addGraph(publishGraph);
                             } else {
                                 chart.removeGraph(publishGraph);
                             }
                             chart.write("chartdiv");
                             zoomChart();
                         }
            function addRemoveDeliverData() {
                             if (document.getElementById("deliverCheck").checked){
                                                    chart.addGraph(deliverGraph);
                             } else {
                                 chart.removeGraph(deliverGraph);
                             }
                             chart.write("chartdiv");
                             zoomChart();
                         }
            function addRemoveAcknowledgedData() {
                             if (document.getElementById("ackCheck").checked){
                                                   // chartData.push.apply(chartData, JSON.parse(o.responseText));
                                                    chart.addGraph(acknowledgedGraph);
                             } else {
                                 chart.removeGraph(acknowledgedGraph);

                             }
                             chart.write("chartdiv");
                             zoomChart();
                         }

    function loadRateDataForRange(){
    }

    function loadTable(onGoingMessageStatus) {

        var table = document.getElementById("tftable");

        var rowCount = table.rows.length;
        for (var x=rowCount-1; x>0; x--) {
           table.deleteRow(x);
        }

        for (var key in onGoingMessageStatus) {
            var obj = onGoingMessageStatus[key];
            var row = table.insertRow(1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            cell1.innerHTML = obj["queue_name"];
            cell2.innerHTML = obj["message_status"];
            cell3.innerHTML = obj["Published"];
            cell4.innerHTML = obj["Delivered"];
            cell5.innerHTML = obj["Acknowledged"];
            var backgroundColor;
            if (obj["message_status"] == "Published") {
                backgroundColor = "#5fb503";
            } else if (obj["message_status"] == "Delivered") {
                backgroundColor = "#FFA500";
            } else {
                backgroundColor = "#00FFFF";
            }
            cell2.style.backgroundColor = backgroundColor;
        }

    }

    function loadMessageStatuses() {

                var selectList = document.getElementById("queueSelect");
                var selectedQueue = selectList.options[selectList.selectedIndex].value;
                var durationSelectList = document.getElementById("durationSelect");
                var selectedDuration = durationSelectList.options[durationSelectList.selectedIndex].value;
                var callback =
                {
                    success:function(o) {
                       var onGoingMessageStatus = JSON.parse(o.responseText);
                       loadTable(onGoingMessageStatus);
                    },
                    failure:function(o) {
                        if (o.responseText !== undefined) {
                            alert("Error " + o.status + "\n Following is the message from the server.\n" + o.responseText);
                        }
                    }
                };
                var request = YAHOO.util.Connect.asyncRequest('POST', "load_message_statuses_ajaxprocessor.jsp", callback, "selectedQueue=" + selectedQueue + "&selectedDuration=" + selectedDuration + "&type=input");

    }