<%
    String selectedQueue = request.getParameter("selectedQueue");
    session.setAttribute( "rateQueueName", selectedQueue );
    out.print((String) session.getAttribute("rateQueueName"));
%>