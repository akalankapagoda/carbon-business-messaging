package org.wso2.carbon.andes.stats;

import org.json.JSONArray;
import org.json.JSONObject;
import org.wso2.andes.server.ClusterResourceHolder;
import org.wso2.andes.server.stats.MessageCounter;
import org.wso2.andes.server.stats.MessageCounterKey;

import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * Created by Akalanka on 8/6/14.
 *
 * This class exposes MessageCounter stats functionalities as a web service.
 */
public class MessageCounterService {

    MessageCounter messageCounter = MessageCounter.getInstance();
    private DateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");   // ISO 8601 Standard Date Format to be retreived by web clients

    /**
     * Get data for message rate graph.
     * @param queueName The queue name, if null all.
     * @param minDate The min date.
     * @param maxDate The max date
     * @return Message rates JSON Array [{"Date":Long, "RatePublished":No.of.Msgs},{"Date":Long, "RateDelivered":No.of.Msgs},{"Date":Long, "RateAcknowledged":No.of.Msgs}]
     */
    public String getGraphDataForRate(String queueName, Long minDate, Long maxDate) {
        String queueToRequest = null;
        if (!"All".equals(queueName)) { // queueName null means All data
            queueToRequest = queueName;
        }
        return messageCounter.getGraphData(queueToRequest, minDate, maxDate);
    }

    /**
     * Get message status for each message in the given time range.
     * @param queueName The queue name, if null all.
     * @param minDate The min date.
     * @param maxDate The max date
     * @return Message Statuses JSON Array [{"queue_Name":"queueName", "Published":"yyyy-MM-dd'T'HH:mm:ssZ", "Delivered": "yyyy-MM-dd'T'HH:mm:ssZ", "Acknowledged": "yyyy-MM-dd'T'HH:mm:ssZ", "message_status":"Acknowledged"}]
     */
    public String getMessageStatuses(String queueName, Long minDate, Long maxDate) {

        String queueToRequest = null;
        if (!"All".equals(queueName)) { // queueName null means All data
            queueToRequest = queueName;
        }

        Map<Long, Map<String, String>> messageStatus = messageCounter.getOnGoingMessageStatus(queueToRequest, minDate, maxDate);
        Iterator<Map<String,String>> iterator = messageStatus.values().iterator();

        JSONArray messageStatuses = new JSONArray();


        while(iterator.hasNext()) {
            Map<String, String> currentEntry = iterator.next();
            Long publishedDate = Long.parseLong(currentEntry.get("Published"));
            Long deliveredDate = Long.parseLong(currentEntry.get("Delivered"));
            Long acknowledgedDate = Long.parseLong(currentEntry.get("Acknowledged"));

            JSONObject jsonObject = new JSONObject();
            jsonObject.put("queue_name", currentEntry.get("queue_name"));
            String currentStatus = "undefined";

            if (publishedDate > 0) {
                jsonObject.put("Published", df.format(new Date(publishedDate)));
                currentStatus = MessageCounterKey.MessageCounterType.PUBLISH_COUNTER.getType();
            }

            if (deliveredDate > 0) {
                jsonObject.put("Delivered", df.format(new Date(deliveredDate)));
                currentStatus = MessageCounterKey.MessageCounterType.DELIVER_COUNTER.getType();
            }
            if (acknowledgedDate > 0) {
                jsonObject.put("Acknowledged", df.format(new Date(deliveredDate)));
                currentStatus = MessageCounterKey.MessageCounterType.ACKNOWLEDGED_COUNTER.getType();
            }
            jsonObject.put("message_status", currentStatus);
            messageStatuses.put(jsonObject);
        }
        return messageStatuses.toString();
    }

    /**
     * Get the configurations value for stats enabled.
     * @return The stats enabled status
     */
    public Boolean isStatsEnabled() {
        return ClusterResourceHolder.getInstance().getClusterConfiguration().isStatsEnabled();
    }
}
