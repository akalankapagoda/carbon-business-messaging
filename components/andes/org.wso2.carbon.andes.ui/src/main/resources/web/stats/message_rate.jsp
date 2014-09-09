<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt" %>
<%@ taglib prefix="carbon" uri="http://wso2.org/projects/carbon/taglibs/carbontags.jar" %>
<%@ page import="org.wso2.carbon.andes.stats.stub.MessageCounterServiceStub" %>
<%@ page import="org.wso2.carbon.andes.stub.AndesAdminServiceStub" %>
<%@ page import="org.wso2.carbon.event.stub.internal.TopicManagerAdminServiceStub" %>
<%@ page import="org.wso2.carbon.event.stub.internal.xsd.TopicNode" %>
<%@ page import="org.wso2.carbon.andes.stub.admin.types.Queue" %>
<%@ page import="org.wso2.carbon.andes.ui.UIUtils" %>
<%@ page import="java.util.Stack" %>
<%@ page import="java.util.Arrays" %>
<!--Yahoo includes for ajax calls-->
<script src="../yui/build/connection/connection-min.js" type="text/javascript"></script>
<!--Local js includes-->
<script src="js/stats.js" type="text/javascript"></script>

<!DOCTYPE html>
<html>
<head>
        <script src="./js/amcharts/amcharts.js" type="text/javascript"></script>
		<script src="./js/amcharts/serial.js" type="text/javascript"></script>


        <script type="text/javascript">
            var chart;
            var chartCursor;

            var publishChartData = [];
            var deliverChartData = [];
            var acknowledgedChartData = [];

            var publishGraph;
            var deliverGraph;
            var acknowledgedGraph;



            AmCharts.ready(function () {
                loadGraphData();
            });
        </script>

</head>

<body>

<h1>Message Rate</h1>
<br>

<%
MessageCounterServiceStub stub = UIUtils.getMessageCounterServiceStub(config, session, request);
AndesAdminServiceStub adminStub = UIUtils.getAndesAdminServiceStub(config, session, request);
TopicManagerAdminServiceStub managerStub = UIUtils.getTopicManagerAdminServiceStub(config, session, request);

if (stub.isStatsEnabled()) {


    String rateQueueName = (String) session.getAttribute("rateQueueName");

    Queue[] queueList = adminStub.getAllQueues();
    TopicNode topicNode = managerStub.getAllTopics();
    TopicNode[] mainTopics = topicNode.getChildren();

    if ((queueList == null || queueList.length == 0) && (mainTopics == null)) {
        out.println("<br><p>No Data to be Displayed</P<br>");
    } else {
%>

Choose the Queue : <select id="queueSelect" onchange="loadGraphData()">
<option value="All">All</option>
<%
        if (queueList != null ) {
            for (Queue queue : queueList) {
                String queueName = queue.getQueueName();
                out.println("<option value=" + queueName + ">" + queueName + "</option>");
            }
        }

            Stack stack = new Stack();
            if (mainTopics != null) {
                stack.addAll(Arrays.asList(mainTopics));
            }
            while (!stack.isEmpty()) {
                Object obj = stack.pop();
                if (!(obj instanceof String)) {
                    TopicNode node = (TopicNode) obj;
                    String nodeName = node.getTopicName();
                    out.println("<option value=" + nodeName+ ">" + nodeName + "</option>");
                    TopicNode[] children = node.getChildren();
                    if (children != null && children.length > 0) {
                        for (TopicNode child : children) {
                            stack.add(child);
                        }
                    }
                }
            }
%>
</select>

Choose duration : <select id="durationSelect" onchange="loadGraphData()">
<option value="lastMinute">Last Minute</option>
<option value="last10Minute">Last 10 Minutes</option>
<option value="lastHour">Last Hour</option>
<option value="last5Hours">Last 5 Hours</option>
<option value="lastDay">Last Day</option>
<option value="lastWeek">Last Week</option>
<option value="All">All Time</option>
</select>

<br>

Choose Message Statuses : <label><input id="publishCheck" type="checkbox" onchange="addRemovePublishData()" checked>Published</label>
<label><input id="deliverCheck" type="checkbox" onchange="addRemoveDeliverData()">Delivered</label>
<label><input id="ackCheck" type="checkbox" onchange="addRemoveAcknowledgedData()">Acknowledged</label>

<div id="chartdiv" style="width: 100%; height: 400px;"></div>

<% }
} else {
%>
    <p> This feature is disabled. Please enabled stats in andes configurations. </p>
<%
}
%>

<br><br><br>

<p id="test"></p>

</body>
</html>