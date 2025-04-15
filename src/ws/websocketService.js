import { createSignal, createEffect, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';
import { config } from '../dataService/config.js';

/**
 * WebSocket connection states
 */
export const WS_STATES = {
  CONNECTING: 0,
  CONNECTED: 1,
  DISCONNECTING: 2,
  DISCONNECTED: 3
};

/**
 * WebSocket message types
 */
export const MESSAGE_TYPES = {
  SUBSCRIBE: 'subscribe',
  SUBSCRIBE_ACK: 'subscribe_ack',
  UNSUBSCRIBE: 'unsubscribe',
  UNSUBSCRIBE_ACK: 'unsubscribe_ack',
  GET_TOPICS: 'get_topics',
  TOPICS: 'topics'
};

/**
 * Creates a WebSocket service with reconnection, heartbeat, and topic subscription capabilities.
 * 
 * @returns {Object} WebSocket service with methods for managing the connection and subscriptions
 */
export function createWebSocketService() {
  // WebSocket instance
  const [socket, setSocket] = createSignal(null);
  
  // Connection state
  const [state, setState] = createSignal(WS_STATES.DISCONNECTED);
  
  // Store for subscribed topics
  const [subscribedTopics, setSubscribedTopics] = createStore([]);
  
  // Store for message handlers by topic
  const [topicHandlers, setTopicHandlers] = createStore({});
  
  // Reconnection settings
  const reconnectDelay = 10000; // 10 seconds
  const [reconnectTimer, setReconnectTimer] = createSignal(null);
  
  // Heartbeat settings
  const heartbeatInterval = 5000; // 5 seconds
  const heartbeatTimeout = 7500; // 7.5 seconds
  const [heartbeatTimer, setHeartbeatTimer] = createSignal(null);
  const [heartbeatTimeoutTimer, setHeartbeatTimeoutTimer] = createSignal(null);
  
  /**
   * Connects to the WebSocket server
   */
  const connect = () => {
    if (socket() && (socket().readyState === WebSocket.CONNECTING || socket().readyState === WebSocket.OPEN)) {
      return; // Already connected or connecting
    }
    
    try {
      setState(WS_STATES.CONNECTING);
      const ws = new WebSocket(config.wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setState(WS_STATES.CONNECTED);
        
        // Clear reconnect timer if it exists
        if (reconnectTimer()) {
          clearTimeout(reconnectTimer());
          setReconnectTimer(null);
        }
        
        // Start heartbeat
        startHeartbeat();
        
        // Resubscribe to topics
        resubscribeToTopics();
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setState(WS_STATES.DISCONNECTED);
        
        // Clear heartbeat timers
        stopHeartbeat();
        
        // Schedule reconnection
        scheduleReconnect();
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        // The onclose handler will be called after this
      };
      
      ws.onmessage = handleMessage;
      
      setSocket(ws);
    } catch (error) {
      console.error('Error connecting to WebSocket:', error);
      setState(WS_STATES.DISCONNECTED);
      scheduleReconnect();
    }
  };
  
  /**
   * Disconnects from the WebSocket server
   */
  const disconnect = () => {
    if (socket() && socket().readyState === WebSocket.OPEN) {
      setState(WS_STATES.DISCONNECTING);
      socket().close();
    }
    
    // Clear timers
    if (reconnectTimer()) {
      clearTimeout(reconnectTimer());
      setReconnectTimer(null);
    }
    
    stopHeartbeat();
  };
  
  /**
   * Schedules a reconnection attempt
   */
  const scheduleReconnect = () => {
    if (reconnectTimer()) {
      clearTimeout(reconnectTimer());
    }
    
    const timer = setTimeout(() => {
      console.log('Attempting to reconnect...');
      connect();
    }, reconnectDelay);
    
    setReconnectTimer(timer);
  };
  
  /**
   * Starts the heartbeat mechanism
   */
  const startHeartbeat = () => {
    if (heartbeatTimer()) {
      clearInterval(heartbeatTimer());
    }
    
    const timer = setInterval(() => {
      if (socket() && socket().readyState === WebSocket.OPEN) {
        socket().send('ping');
        
        // Set a timeout to check if we received a pong
        if (heartbeatTimeoutTimer()) {
          clearTimeout(heartbeatTimeoutTimer());
        }
        
        const timeoutTimer = setTimeout(() => {
          console.log('Heartbeat timeout, reconnecting...');
          if (socket()) {
            socket().close();
            // onclose will handle reconnection
          }
        }, heartbeatTimeout);
        
        setHeartbeatTimeoutTimer(timeoutTimer);
      }
    }, heartbeatInterval);
    
    setHeartbeatTimer(timer);
  };
  
  /**
   * Stops the heartbeat mechanism
   */
  const stopHeartbeat = () => {
    if (heartbeatTimer()) {
      clearInterval(heartbeatTimer());
      setHeartbeatTimer(null);
    }
    
    if (heartbeatTimeoutTimer()) {
      clearTimeout(heartbeatTimeoutTimer());
      setHeartbeatTimeoutTimer(null);
    }
  };
  
  /**
   * Handles incoming WebSocket messages
   * 
   * @param {MessageEvent} event - The WebSocket message event
   */
  const handleMessage = (event) => {
    // Reset heartbeat timeout on any message (including pong)
    if (heartbeatTimeoutTimer()) {
      clearTimeout(heartbeatTimeoutTimer());
      setHeartbeatTimeoutTimer(null);
    }
    
    // Handle pong message
    if (event.data === 'pong') {
      return;
    }
    
    // Parse JSON messages
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      return;
    }
    
    // Handle subscription acknowledgments
    if (data.type === MESSAGE_TYPES.SUBSCRIBE_ACK) {
      console.log(`Subscription to ${data.topic} ${data.success ? 'successful' : 'failed'}`);
      return;
    }
    
    // Handle unsubscription acknowledgments
    if (data.type === MESSAGE_TYPES.UNSUBSCRIBE_ACK) {
      console.log(`Unsubscription from ${data.topic} ${data.success ? 'successful' : 'failed'}`);
      return;
    }
    
    // Handle topics list response
    if (data.type === MESSAGE_TYPES.TOPICS) {
      console.log('Subscribed topics:', data.topics);
      setSubscribedTopics(data.topics);
      return;
    }
    
    // Handle topic-specific messages
    // Find handlers for this message based on its content
    for (const topic in topicHandlers) {
      const handlers = topicHandlers[topic];
      
      // Check if this message is relevant for this topic
      // This depends on the message format for each topic
      if (
        (topic === 'task_completion_update' && data.Result === 'Event Task Updated') ||
        (topic === 'event_updates' && data.message === 'Overview added successfully') ||
        (topic.startsWith('central_') && data.message === 'Overview added successfully' && data.data?.central_id === topic.substring(8)) ||
        (topic === 'task_completion_map_update' && data.type === 'task_completion_update')
      ) {
        // Call all handlers for this topic
        handlers.forEach(handler => handler(data));
      }
    }
  };
  
  /**
   * Resubscribes to all previously subscribed topics
   */
  const resubscribeToTopics = () => {
    if (subscribedTopics.length > 0 && socket() && socket().readyState === WebSocket.OPEN) {
      subscribedTopics.forEach(topic => {
        sendSubscribeMessage(topic);
      });
    }
  };
  
  /**
   * Sends a subscribe message to the server
   * 
   * @param {string} topic - The topic to subscribe to
   */
  const sendSubscribeMessage = (topic) => {
    if (socket() && socket().readyState === WebSocket.OPEN) {
      const message = {
        type: MESSAGE_TYPES.SUBSCRIBE,
        topic: topic
      };
      socket().send(JSON.stringify(message));
    }
  };
  
  /**
   * Sends an unsubscribe message to the server
   * 
   * @param {string} topic - The topic to unsubscribe from
   */
  const sendUnsubscribeMessage = (topic) => {
    if (socket() && socket().readyState === WebSocket.OPEN) {
      const message = {
        type: MESSAGE_TYPES.UNSUBSCRIBE,
        topic: topic
      };
      socket().send(JSON.stringify(message));
    }
  };
  
  /**
   * Sends a request to get the list of subscribed topics
   */
  const sendGetTopicsMessage = () => {
    if (socket() && socket().readyState === WebSocket.OPEN) {
      const message = {
        type: MESSAGE_TYPES.GET_TOPICS
      };
      socket().send(JSON.stringify(message));
    }
  };
  
  /**
   * Subscribes to a topic and registers a message handler
   * 
   * @param {string} topic - The topic to subscribe to
   * @param {Function} handler - The function to call when a message for this topic is received
   * @returns {Function} A function to unsubscribe from the topic
   */
  const subscribe = (topic, handler) => {
    // Add to local subscribed topics if not already there
    if (!subscribedTopics.includes(topic)) {
      setSubscribedTopics([...subscribedTopics, topic]);
      
      // Send subscribe message to server
      sendSubscribeMessage(topic);
    }
    
    // Add handler to topic handlers
    const currentHandlers = topicHandlers[topic] || [];
    setTopicHandlers(topic, [...currentHandlers, handler]);
    
    // Return unsubscribe function
    return () => {
      unsubscribe(topic, handler);
    };
  };
  
  /**
   * Unsubscribes from a topic and removes a message handler
   * 
   * @param {string} topic - The topic to unsubscribe from
   * @param {Function} handler - The handler to remove
   */
  const unsubscribe = (topic, handler) => {
    // Remove handler from topic handlers
    const currentHandlers = topicHandlers[topic] || [];
    const newHandlers = currentHandlers.filter(h => h !== handler);
    
    if (newHandlers.length === 0) {
      // No more handlers for this topic, remove it from topicHandlers
      const newTopicHandlers = { ...topicHandlers };
      delete newTopicHandlers[topic];
      setTopicHandlers(newTopicHandlers);
      
      // Remove from local subscribed topics
      setSubscribedTopics(subscribedTopics.filter(t => t !== topic));
      
      // Send unsubscribe message to server
      sendUnsubscribeMessage(topic);
    } else {
      // Update handlers for this topic
      setTopicHandlers(topic, newHandlers);
    }
  };
  
  /**
   * Gets the current connection state
   * 
   * @returns {number} The current connection state
   */
  const getState = () => state();
  
  /**
   * Gets the list of subscribed topics
   * 
   * @returns {Array<string>} The list of subscribed topics
   */
  const getSubscribedTopics = () => {
    // Request the list from the server
    sendGetTopicsMessage();
    
    // Return the local list
    return subscribedTopics;
  };
  
  // Return the public API
  return {
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    getState,
    getSubscribedTopics,
    WS_STATES
  };
}

// Create a singleton instance of the WebSocket service
const websocketService = createWebSocketService();

export default websocketService;