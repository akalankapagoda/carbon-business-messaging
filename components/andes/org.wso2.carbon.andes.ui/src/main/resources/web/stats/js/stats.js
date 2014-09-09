            var dataLimit = 10000;
            var chartData = [];
            var pager;
            var currentPage = 1;
            var currentPageCount = 0;
            var pageEnder = [];
            var currentOutput = [];
            pageEnder[0] = 0;
            pageEnder[1] = 0;

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
                publishGraph.valueField = "Published";
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
                deliverGraph.valueField = "Delivered";
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
                acknowledgedGraph.valueField = "Acknowledged";
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
                var callback = {
                    success: function(o) {
                        document.getElementById("test").innerHTML = JSON.stringify(o.responseText);
                    },
                    failure: function(o) {
                        if (o.responseText !== undefined) {
                            alert("Error " + o.status + "\n Following is the message from the server.\n" + o.responseText);
                        }
                    }
                };
                var request = YAHOO.util.Connect.asyncRequest('POST', "set_current_queue_ajaxprocessor.jsp", callback, "selectedQueue=" + selectedQueue + "&type=input");
            }

             // Change session queue variable on queueSelect
            function loadGraphData() {
//                prepareChartData([], 0);
                    currentOutput = [];
                    prepareChartDataByStatus([], 0, "Published");
                //                var queueSelectList = document.getElementById("queueSelect");
                //                var selectedQueue = queueSelectList.options[queueSelectList.selectedIndex].value;
                //                var durationSelectList = document.getElementById("durationSelect");
                //                var selectedDuration = durationSelectList.options[durationSelectList.selectedIndex].value;
                //                var callback =
                //                {
                //                    success:function(o) {
                //                       rawData = JSON.parse(o.responseText);
                //                       prepareChartData([],0);
                //                       chartData = JSON.parse(o.responseText);
                //                       drawChart();
                //                       document.getElementById("publishCheck").checked = true;
                //                       document.getElementById("deliverCheck").checked = false;
                //                       document.getElementById("ackCheck").checked = false;
                //                    },
                //                    failure:function(o) {
                //                        if (o.responseText !== undefined) {
                //                            alert("Error " + o.status + "\n Following is the message from the server.\n" + o.responseText);
                //                        }
                //                    }
                //                };
                //                var request = YAHOO.util.Connect.asyncRequest('POST', "load_graph_data_ajaxprocessor.jsp", callback, "selectedQueue=" + selectedQueue + "&selectedDuration=" + selectedDuration + "&type=input");
            }

            function prepareChartData(onGoingMessageStatus, minMessageId) {

                var selectList = document.getElementById("queueSelect");
                var selectedQueue = selectList.options[selectList.selectedIndex].value;
                var durationSelectList = document.getElementById("durationSelect");
                var selectedDuration = durationSelectList.options[durationSelectList.selectedIndex].value;
                var callback = {
                    success: function(o) {
                        var output = JSON.parse(o.responseText);
                        onGoingMessageStatus = onGoingMessageStatus.concat(output);

                        if (output.length < dataLimit) { // Last of the messages have been retrieved
                            generateChartData(onGoingMessageStatus);
                        } else {
                            var newMinMessageId = output[output.length - 1]["messageId"];
                            prepareChartData(onGoingMessageStatus, newMinMessageId);
                        }
                    },
                    failure: function(o) {
                        if (o.responseText !== undefined) {
                            alert("Error " + o.status + "\n Following is the message from the server.\n" + o.responseText);
                        }
                    }
                };
                var request = YAHOO.util.Connect.asyncRequest('POST', "load_message_statuses_ajaxprocessor.jsp", callback, "selectedQueue=" + selectedQueue + "&selectedDuration=" + selectedDuration + "&minMessageId=" + minMessageId + "&limit=" + dataLimit + "&compareAllStatuses=true" + "&type=input");

            }

            function prepareChartDataByStatus(currentResults, minMessageId, messageStatus) {

                var selectList = document.getElementById("queueSelect");
                var selectedQueue = selectList.options[selectList.selectedIndex].value;
                var durationSelectList = document.getElementById("durationSelect");
                var selectedDuration = durationSelectList.options[durationSelectList.selectedIndex].value;
                var callback = {
                    success: function(o) {
                        var output = JSON.parse(o.responseText);
                        currentResults = currentResults.concat(output);

                        if (output.length < dataLimit) { // Last of the messages have been retrieved
                              if(messageStatus == "Published") {
                                currentOutput[0] = currentResults;
                                prepareChartDataByStatus([], 0, "Delivered");
                              } else if (messageStatus == "Delivered") {
                                currentOutput[1] = currentResults;
                                prepareChartDataByStatus([], 0, "Acknowledged");
                              } else if (messageStatus == "Acknowledged") {
                                currentOutput[2] = currentResults;
                                generateChartData([]);
                              }
//                            generateChartData(onGoingMessageStatus);
                        } else {
                            var newMinMessageId = output[output.length - 1]["messageId"];
                            prepareChartData(currentResults, newMinMessageId);
                        }
                    },
                    failure: function(o) {
                        if (o.responseText !== undefined) {
                            alert("Error " + o.status + "\n Following is the message from the server.\n" + o.responseText);
                        }
                    }
                };
                var request = YAHOO.util.Connect.asyncRequest('POST', "load_graph_data_ajaxprocessor.jsp", callback, "selectedQueue=" + selectedQueue + "&selectedDuration=" + selectedDuration + "&minMessageId=" + minMessageId + "&limit=" + dataLimit + "&messageCounterType=" + messageStatus + "&type=input");

            }

            function generateChartData(onGoingMessageStatus) {
                var publishRate = [];
                var deliverRate = [];
                var acknowledgedRate = [];
                chartData = [];

                var lowerBoundary = parseInt("9223372036854775807"); // Largest Long value in JAVA
                var upperBoundary = 0;


                var processingOutput = currentOutput[0];
                for (var key in processingOutput) {
                    var currentMessage = processingOutput[key];
                     var publishedTime = parseInt(currentMessage["Published"]);

                     if (publishedTime > 0) {
                        if (publishedTime < lowerBoundary) { // New lower boundary found
                            lowerBoundary = publishedTime;
                        }
                        publishRate.push(publishedTime);
                     }
                }

                processingOutput = currentOutput[1];

                for (var key in processingOutput) {
                    var currentMessage = processingOutput[key];
                     var deliveredTime = parseInt(currentMessage["Delivered"]);

                    if (deliveredTime > 0) {
                        deliverRate.push(deliveredTime);
                    }
                }

                processingOutput = currentOutput[2];

                for (var key in processingOutput) {
                    var currentMessage = processingOutput[key];
                     var acknowledgedTime = parseInt(currentMessage["Acknowledged"]);

                    if (acknowledgedTime > 0) {
                        if (acknowledgedTime > upperBoundary) { // New upper boundary found
                            upperBoundary = acknowledgedTime;
                        }
                        acknowledgedRate.push(acknowledgedTime);
                    }
                }



//                for (var key in onGoingMessageStatus) {
//                    var currentMessage = onGoingMessageStatus[key];
//
//                    // parseInt will round the time millis into nearest second
//                    var publishedTime = parseInt(currentMessage["Published"]);
//                    var deliveredTime = parseInt(currentMessage["Delivered"]);
//                    var acknowledgedTime = parseInt(currentMessage["Acknowledged"]);
//
//                    if (publishedTime > 0) {
//                        if (publishedTime < lowerBoundary) { // New lower boundary found
//                            lowerBoundary = publishedTime;
//                        }
//                        publishRate.push(publishedTime);
//                    }
//
//                    if (deliveredTime > 0) {
//                        deliverRate.push(deliveredTime);
//                    }
//
//                    if (acknowledgedTime > 0) {
//                        if (acknowledgedTime > upperBoundary) { // New upper boundary found
//                            upperBoundary = acknowledgedTime;
//                        }
//                        acknowledgedRate.push(acknowledgedTime);
//                    }
//                }

                publishRate.sort();
                deliverRate.sort();
                acknowledgedRate.sort();
                var processingUnit = publishRate[0];
                var processingCount = 0;

                // Processing Publish
                for (var key in publishRate) {
                    var currVal = publishRate[key];
                    if (currVal == processingUnit) {
                        processingCount = processingCount + 1;
                    } else {
                        chartData.push({
                            "Date": processingUnit,
                            "Published": processingCount
                        });
                        var diff = (currVal - processingUnit) / 1000;

                        // Fill values between adjacent two points
                        if (diff > 1) {
                            chartData.push({
                                "Date": processingUnit + 1000,
                                "Published": 0
                            });

                            if (diff > 2) {
                                chartData.push({
                                    "Date": currVal - 1000,
                                    "Published": 0
                                });
                            }
                        }

                        processingUnit = currVal;
                        processingCount = 1;
                    }
                }

                chartData.push({
                    "Date": processingUnit,
                    "Published": processingCount
                }); // Enter the final element.

                // Processing Deliver
                processingUnit = deliverRate[0];
                processingCount = 0;
                for (var key in deliverRate) {
                    var currVal = deliverRate[key];
                    if (currVal == processingUnit) {
                        processingCount = processingCount + 1;
                    } else {
                        chartData.push({
                            "Date": processingUnit,
                            "Delivered": processingCount
                        });
                        var diff = (currVal - processingUnit) / 1000; // The difference in adjacent points in seconds

                        // Fill values between adjacent two points
                        if (diff > 1) {
                            chartData.push({
                                "Date": processingUnit + 1000,
                                "Delivered": 0
                            });

                            if (diff > 2) {
                                chartData.push({
                                    "Date": currVal - 1000,
                                    "Delivered": 0
                                });
                            }
                        }

                        processingUnit = currVal;
                        processingCount = 1;
                    }
                }

                chartData.push({
                    "Date": processingUnit,
                    "Delivered": processingCount
                }); // Enter the final element.

                // Processing Acknowledged
                processingUnit = acknowledgedRate[0];
                processingCount = 0;
                for (var key in acknowledgedRate) {
                    var currVal = acknowledgedRate[key];
                    if (currVal == processingUnit) {
                        processingCount = processingCount + 1;
                    } else {
                        chartData.push({
                            "Date": processingUnit,
                            "Acknowledged": processingCount
                        });
                        var diff = (currVal - processingUnit) / 1000;

                        // Fill values between adjacent two points
                        if (diff > 1) {
                            chartData.push({
                                "Date": processingUnit + 1000,
                                "Acknowledged": 0
                            });

                            if (diff > 2) {
                                chartData.push({
                                    "Date": currVal - 1000,
                                    "Acknowledged": 0
                                });
                            }
                        }

                        processingUnit = currVal;
                        processingCount = 1;
                    }
                }

                chartData.push({
                    "Date": processingUnit,
                    "Acknowledged": processingCount
                }); // Enter the final element.

                // Get all three graphs to the same value range
                var firstDeliverPoint = deliverRate[0];
                if (firstDeliverPoint > lowerBoundary) {
                    chartData.unshift({
                        "Date": lowerBoundary,
                        "Delivered": 0
                    });
                    chartData.unshift({
                        "Date": firstDeliverPoint - 1000,
                        "Delivered": 0
                    });
                    //            deliverRate.unshift(lowerBoundary);
                }

                var firstAcknowledgePoint = acknowledgedRate[0];
                if (firstAcknowledgePoint > lowerBoundary) {
                    chartData.unshift({
                        "Date": lowerBoundary,
                        "Acknowledged": 0
                    });
                    chartData.unshift({
                        "Date": firstAcknowledgePoint - 1000,
                        "Acknowledged": 0
                    });
                    //            acknowledgedRate.unshift(lowerBoundary);
                }

                var lastDeliverPoint = deliverRate[deliverRate.length - 1];
                if (lastDeliverPoint < upperBoundary) {
                    chartData.push({
                        "Date": lastDeliverPoint + 1000,
                        "Delivered": 0
                    });
                    chartData.push({
                        "Date": upperBoundary,
                        "Delivered": 0
                    });
                    //            deliverRate.push(upperBoundary);
                }

                var lastPublishPoint = publishRate[publishRate.length - 1];
                if (lastPublishPoint < upperBoundary) {
                    chartData.push({
                        "Date": lastPublishPoint + 1000,
                        "Published": 0
                    });
                    chartData.push({
                        "Date": upperBoundary,
                        "Published": 0
                    });
                    //            publishRate.push(upperBoundary);
                }

                //        document.getElementById("test").innerHTML = JSON.stringify(chartData);

                drawChart();
                checkStatusCheckBoxes();

            }

            function checkStatusCheckBoxes() {
                addRemoveAcknowledgedData();
                addRemoveDeliverData();
                addRemovePublishData();
            }

            function addRemovePublishData() {
                if (document.getElementById("publishCheck").checked) {
                    chart.addGraph(publishGraph);
                } else {
                    chart.removeGraph(publishGraph);
                }
                chart.write("chartdiv");
            }

            function addRemoveDeliverData() {
                if (document.getElementById("deliverCheck").checked) {
                    chart.addGraph(deliverGraph);
                } else {
                    chart.removeGraph(deliverGraph);
                }
                chart.write("chartdiv");
            }

            function addRemoveAcknowledgedData() {
                if (document.getElementById("ackCheck").checked) {
                    // chartData.push.apply(chartData, JSON.parse(o.responseText));
                    chart.addGraph(acknowledgedGraph);
                } else {
                    chart.removeGraph(acknowledgedGraph);

                }
                chart.write("chartdiv");
            }

            function loadTable(onGoingMessageStatus) {

                var table = document.getElementById("tftable");

                var rowCount = table.rows.length;
                for (var x = rowCount - 1; x > 0; x--) {
                    table.deleteRow(x);
                }

                for (var key = onGoingMessageStatus.length - 1; key>=0; key--) {
                    var obj = onGoingMessageStatus[key];
                    var row = table.insertRow(1);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    var cell4 = row.insertCell(3);
                    var cell5 = row.insertCell(4);
                    var cell6 = row.insertCell(5);
                    cell1.innerHTML = obj["messageId"];
                    cell2.innerHTML = obj["queue_name"];
                    var publishedTime = obj["Published"];
                    var deliveredTime = obj["Delivered"];
                    var acknowledgedTime = obj["Acknowledged"];
                    var deliverString = "Not Delivered";
                    var acknowledgedString = "Not Acknowledged";
                    var messageStatus = "Published";
                    var backgroundColor = "#5fb503";

                    cell4.innerHTML = new Date(publishedTime).toString();

                    if (deliveredTime > 0) {
                        deliverString = new Date(deliveredTime).toString();
                        messageStatus = "Delivered";
                        backgroundColor = "#FFA500"
                    }

                    if (acknowledgedTime > 0) {
                        acknowledgedString = new Date(acknowledgedTime).toString();
                        messageStatus = "Acknowledged";
                        backgroundColor = "#00FFFF";
                    }

                    cell5.innerHTML = deliverString;
                    cell6.innerHTML = acknowledgedString;

                    cell3.innerHTML = messageStatus;
                    cell3.style.backgroundColor = backgroundColor;
                }
                loadMessageStatusCount();
                //paginate();

            }

            function paginate() {
                pager = new Pager('tftable', 3);
                pager.init();
                pager.showPageNav('pager', 'pageNavPosition');
                pager.showPage(1);
            }

            function setNav() {
                var pagerHtml = '<span onclick="' + pagerName + '.prev();" class="pg-normal"> &#171 Prev </span> | ';
            }

            function initialisePaging() {
                currentPage = 1;
                currentPageCount = 0;
                pageEnder = [];
                pageEnder[0] = 0;
                pageEnder[1] = 0;
                document.getElementById("prevButton").disabled = true;
            }

            function nextPage(isMovingToNextPage) {
                document.getElementById("prevButton").disabled = false;
                loadMessagesForPage(pageEnder[currentPage]);
                if (isMovingToNextPage) {
                    currentPage = currentPage + 1;
                }
            }

            function prevPage() {
                document.getElementById("nextButton").disabled =false;
                loadMessagesForPage(pageEnder[currentPage - 2]);
                currentPage = currentPage - 1;
            }

            function loadMessagesForPage(minMessageId) {

                var pageLimit = 100;

                var selectList = document.getElementById("queueSelect");
                var selectedQueue = selectList.options[selectList.selectedIndex].value;
                var durationSelectList = document.getElementById("durationSelect");
                var selectedDuration = durationSelectList.options[durationSelectList.selectedIndex].value;
                var callback = {
                    success: function(o) {
                        var output = JSON.parse(o.responseText);

                            pageEnder[currentPage] = output[output.length - 1]["messageId"];
                            currentPageCount = output.length;

                            if (currentPage == 1) {
                                document.getElementById("prevButton").disabled = true;
                            }
                            if (output.length < pageLimit) {
                                document.getElementById("nextButton").disabled = true;
                            } else {
                                document.getElementById("nextButton").disabled = false;
                            }

                        loadTable(output);
                    },
                    failure: function(o) {
                        if (o.responseText !== undefined) {
                            alert("Error " + o.status + "\n Following is the message from the server.\n" + o.responseText);
                        }
                    }
                };
                var request = YAHOO.util.Connect.asyncRequest('POST', "load_message_statuses_ajaxprocessor.jsp", callback, "selectedQueue=" + selectedQueue + "&selectedDuration=" + selectedDuration + "&minMessageId=" + minMessageId + "&limit=" + pageLimit + "&compareAllStatuses=false" + "&type=input");

            }

            function statusInitializeAndLoad() {
                initialisePaging();
                nextPage(false);
            }

            function loadMessageStatusCount() {

                var selectList = document.getElementById("queueSelect");
                var selectedQueue = selectList.options[selectList.selectedIndex].value;
                var durationSelectList = document.getElementById("durationSelect");
                var selectedDuration = durationSelectList.options[durationSelectList.selectedIndex].value;
                var callback = {
                    success: function(o) {
                        var output = o.responseText;
                        var currentPageStart = (currentPage - 1) * 100;

                         document.getElementById("countLabel").innerHTML = "Showing " + parseFloat(currentPageStart + 1) + " - " + parseFloat(currentPageStart + currentPageCount) + " of " + output;
                    },
                    failure: function(o) {
                        if (o.responseText !== undefined) {
                            alert("Error " + o.status + "\n Following is the message from the server.\n" + o.responseText);
                        }
                    }
                };
                var request = YAHOO.util.Connect.asyncRequest('POST', "load_message_statuses_count_ajaxprocessor.jsp", callback, "selectedQueue=" + selectedQueue + "&selectedDuration=" + selectedDuration + "&type=input");

            }