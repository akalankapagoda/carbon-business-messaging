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
</head>

<style type="text/css">
.tftable {font-size:12px;color:#333333;width:100%;border-width: 1px;border-color: #729ea5;border-collapse: collapse;}
.tftable th {font-size:12px;background-color:#acc8cc;border-width: 1px;padding: 8px;border-style: solid;border-color: #729ea5;text-align:left;}
.tftable tr {background-color:#d4e3e5;}
.tftable td {font-size:12px;border-width: 1px;padding: 8px;border-style: solid;border-color: #729ea5;}
.tftable tr:hover {background-color:#ffffff;}
</style>

<%
String selectedQueue = request.getParameter("selectedQueue");
session.setAttribute( "rateQueueName", selectedQueue );
MessageCounterServiceStub stub = UIUtils.getMessageCounterServiceStub(config, session, request);
AndesAdminServiceStub adminStub = UIUtils.getAndesAdminServiceStub(config, session, request);
TopicManagerAdminServiceStub managerStub = UIUtils.getTopicManagerAdminServiceStub(config, session, request);

if(stub.isStatsEnabled()) {

%>

<body onload="loadMessagesWithDirectFiltering();">

<h1>Message Statuses</h1>
<br>

<%
    Queue[] queueList = adminStub.getAllQueues();
    TopicNode topicNode = managerStub.getAllTopics();
    TopicNode[] mainTopics = topicNode.getChildren();

    if ((queueList == null || queueList.length == 0) && (mainTopics == null)) {
        out.println("<br><p>No Data to be Displayed</p><br>");
    } else {
%>

Choose the Queue : <select id="queueSelect" onchange="loadMessagesWithDirectFiltering()">
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


Choose duration : <select id="durationSelect" onchange="loadMessagesWithDirectFiltering()">
<option value="lastMinute">Last Minute</option>
<option value="last10Minute">Last 10 Minutes</option>
<option value="lastHour">Last Hour</option>
<option value="last5Hours">Last 5 Hours</option>
<option value="lastDay">Last Day</option>
<option value="lastWeek">Last Week</option>
<option value="All">All Time</option>
<option value="Custom">Custom</option>
</select>


<br><br>

<div id="timeFilter"></div>

<p id="countLabel"></p>

<br>

<table class="tftable" id="tftable" border="1">
<tr><th>Message Id</th><th>Queue Name</th><th>Status</th><th>Message Published Time</th><th>Message Delivered Time</th><th>Message Acknowledged Time</th>
</table>

<div id="pageNavPosition"></div>
<button type="button" id="prevButton" disabled onclick="prevPage()">&#171 Prev</button>
<button type="button" id="nextButton" onclick="nextPage(true)">Next &#187</button>

<%
    }
} else {
%>
<h1>Message Statuses</h1>
<br>
<body>
    <p> This feature is disabled. Please enabled stats in andes configurations. </p>
<%
}
%>

<br><br>

</body>

</html>