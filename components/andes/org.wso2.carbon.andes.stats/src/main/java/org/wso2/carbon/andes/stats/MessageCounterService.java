/*
*  Copyright (c) 2005-2010, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
*  WSO2 Inc. licenses this file to you under the Apache License,
*  Version 2.0 (the "License"); you may not use this file except
*  in compliance with the License.
*  You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

package org.wso2.carbon.andes.stats;

import org.json.JSONArray;
import org.json.JSONObject;
import org.wso2.andes.server.ClusterResourceHolder;
import org.wso2.andes.server.stats.MessageCounter;
import org.wso2.andes.server.stats.MessageCounterKey;
import org.wso2.andes.server.stats.MessageStatus;

import java.util.Map;
import java.util.Set;

/**
 *
 * This class exposes MessageCounter stats functionality as a web service.
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

        Set<MessageStatus> messageStatus = messageCounter.getOnGoingMessageStatus(queueToRequest, minDate, maxDate, minMessageId, limit, compareAllStatuses);

        JSONArray messageStatuses = new JSONArray();


        for(MessageStatus currentEntry : messageStatus) {
            Long messageId = currentEntry.getMessageId();
            Long publishedDate = currentEntry.getPublishedTime() / 1000 * 1000;
            Long deliveredDate = currentEntry.getDeliveredTime() / 1000 * 1000;
            Long acknowledgedDate = currentEntry.getAcknowledgedTime() / 1000 * 1000;

            JSONObject jsonObject = new JSONObject();
            jsonObject.put("messageId", messageId);
            jsonObject.put("queue_name", currentEntry.getQueueName());

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
