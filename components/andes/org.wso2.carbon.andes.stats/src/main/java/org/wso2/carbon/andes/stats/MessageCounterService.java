package org.wso2.carbon.andes.stats;

import org.json.JSONArray;
import org.json.JSONObject;
import org.wso2.andes.server.ClusterResourceHolder;
import org.wso2.andes.server.stats.MessageCounter;
import org.wso2.andes.server.stats.MessageCounterKey;

import java.util.Map;

/**
 * Created by Akalanka on 8/6/14.
 *
 * This class exposes MessageCounter stats functionalities as a web service.
 */
public class MessageCounterService {

    MessageCounter messageCounter = MessageCounter.getInstance();

    /**
     * Get message status for each message in the given time range.
     * @param queueName The queue name, if null all.
     * @param minDate The min date.
     * @param maxDate The max date
     * @param minMessageId The message retrieval lower boundary.
     * @param limit The amout of messages to retrieve.
     * @param compareAllStatuses Compare all the status changes occured within the time period or compare only the published time.
     * @return Message Statuses JSON Array [{"messageId":1234567890, "queue_Name":"queueName", "Published":timemillis, "Delivered": timemillis, "Acknowledged": timemillis}]
     */
    public String getMessageStatuses(String queueName, Long minDate, Long maxDate, Long minMessageId, Long limit, Boolean compareAllStatuses) {

        String queueToRequest = null;
        if (!"All".equals(queueName)) { // queueName null means All data
            queueToRequest = queueName;
        }

        Map<Long, Map<String, String>> messageStatus = messageCounter.getOnGoingMessageStatus(queueToRequest, minDate, maxDate, minMessageId, limit, compareAllStatuses);

        JSONArray messageStatuses = new JSONArray();


        for(Map.Entry<Long,Map<String,String>> currentEntry : messageStatus.entrySet()) {
            Long messageId = currentEntry.getKey();
            Map<String,String> currentValues = currentEntry.getValue();
            Long publishedDate = Long.parseLong(currentValues.get("Published")) / 1000 * 1000;
            Long deliveredDate = Long.parseLong(currentValues.get("Delivered")) / 1000 * 1000;
            Long acknowledgedDate = Long.parseLong(currentValues.get("Acknowledged")) / 1000 * 1000;

            JSONObject jsonObject = new JSONObject();
            jsonObject.put("messageId", messageId);
            jsonObject.put("queue_name", currentValues.get("queue_name"));

            if (compareAllStatuses) { // Omit data from out of scope values retrieved when comparing all columns
                if (publishedDate <= minDate || publishedDate >= maxDate) {
                    publishedDate = 0l;
                }
                if (deliveredDate <= minDate || deliveredDate >= maxDate) {
                    deliveredDate = 0l;
                }
                if (acknowledgedDate <= minDate || acknowledgedDate >= maxDate) {
                    acknowledgedDate = 0l;
                }
            }
            jsonObject.put("Published", publishedDate);
            jsonObject.put("Delivered", deliveredDate);
            jsonObject.put("Acknowledged", acknowledgedDate);

            messageStatuses.put(jsonObject);
        }
        return messageStatuses.toString();
    }

    /**
     * The message count for a given time range and given queue.
     *
     * @param queueName The queue name, if null all.
     * @param minDate The min date.
     * @param maxDate The max date
     * @return Message count.
     */
    public Long getMessageStatusCount(String queueName, Long minDate, Long maxDate) {
        String queueToRequest = null;
        if (!"All".equals(queueName)) { // queueName null means All data
            queueToRequest = queueName;
        }

        return messageCounter.getMessageStatusCounts(queueToRequest, minDate, maxDate);
    }

    /**
     * Get message status change times for a given message status type.
     *
     * @param queueName The queue name, if null all.
     * @param minDate The min date.
     * @param maxDate The max date
     * @param minMessageId The message retrieval lower boundary.
     * @param limit The amout of messages to retrieve.
     * @param messageCounterTypeValue The message status change type to retrieve data about.
     * @return Map<MessageId  MessageStatusChangeTime>
     */
    public String getMessageStatusChangeTimes(String queueName, Long minDate, Long maxDate, Long minMessageId, Long limit, String messageCounterTypeValue) {
        JSONArray messageStatuses = new JSONArray();

        String queueToRequest = null;
        if (!"All".equals(queueName)) { // queueName null means All data
            queueToRequest = queueName;
        }

        MessageCounterKey.MessageCounterType messageCounterType = MessageCounterKey.MessageCounterType.PUBLISH_COUNTER;

        if (MessageCounterKey.MessageCounterType.DELIVER_COUNTER.getType().equals(messageCounterTypeValue)) {
            messageCounterType = MessageCounterKey.MessageCounterType.DELIVER_COUNTER;
        } else if (MessageCounterKey.MessageCounterType.ACKNOWLEDGED_COUNTER.getType().equals(messageCounterTypeValue)) {
            messageCounterType = MessageCounterKey.MessageCounterType.ACKNOWLEDGED_COUNTER;
        }

        Map<Long, Long> statusChanges = messageCounter.getMessageStatusChangeTimes(queueToRequest, minDate, maxDate, minMessageId, limit, messageCounterType);

        for(Map.Entry<Long, Long> currentEntry : statusChanges.entrySet()) {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("messageId", currentEntry.getKey());
            jsonObject.put(messageCounterType.getType(), currentEntry.getValue() / 1000 * 1000);

            messageStatuses.put(jsonObject);
        }

        return messageStatuses.toString();
    }

    /**
     * Get the configurations value for stats enabled.
     * @return The stats enabled status.
     */
    public Boolean isStatsEnabled() {
        return ClusterResourceHolder.getInstance().getClusterConfiguration().isStatsEnabled();
    }
}
