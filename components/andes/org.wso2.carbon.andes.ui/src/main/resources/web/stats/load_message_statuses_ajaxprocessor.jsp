<%@ page import="org.wso2.carbon.andes.stats.stub.MessageCounterServiceStub" %>
<%@ page import="org.wso2.carbon.andes.ui.UIUtils" %>
<%@ page import="java.util.Calendar" %>
<%
     String selectedQueue = request.getParameter("selectedQueue");
     String selectedDuration = request.getParameter("selectedDuration");

     if (selectedQueue != null) {
         session.setAttribute( "rateQueueName", selectedQueue );
         MessageCounterServiceStub stub = UIUtils.getMessageCounterServiceStub(config, session, request);

        Long minDate = null;
        Long maxDate = System.currentTimeMillis();

        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(maxDate);

        if ("lastMinute".equals(selectedDuration)) {
            calendar.add(Calendar.MINUTE, -1);
        } else if ("last10Minute".equals(selectedDuration)) {
            calendar.add(Calendar.MINUTE, -10);
        } else if ("lastHour".equals(selectedDuration)) {
            calendar.add(Calendar.HOUR_OF_DAY, -1);
        } else if ("last5Hours".equals(selectedDuration)) {
            calendar.add(Calendar.HOUR_OF_DAY, -5);
        } else if ("lastDay".equals(selectedDuration)) {
            calendar.add(Calendar.DAY_OF_YEAR, -1);
        } else if ("lastWeek".equals(selectedDuration)) {
            calendar.add(Calendar.WEEK_OF_YEAR, -1);
        } else {
            calendar.add(Calendar.YEAR, -1);
        }

        minDate = calendar.getTimeInMillis();

         out.print(stub.getMessageStatuses(selectedQueue, minDate, maxDate));
     } else {
        out.print("[]");
     }
%>