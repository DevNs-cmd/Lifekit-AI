PING

SELECT 0

SET rate_limit:user:1 1 EX 60
GET rate_limit:user:1
INCR rate_limit:user:1
TTL rate_limit:user:1

SET lock:user:1 "locked" NX EX 30
GET lock:user:1
TTL lock:user:1
DEL lock:user:1
GET lock:user:1

SUBSCRIBE lifekit_notifications

PUBLISH lifekit_notifications "Welcome to LifeKit!"
PUBLISH lifekit_notifications "User 1 completed today's journal."
PUBLISH lifekit_notifications "New mission unlocked!"
PUBLISH lifekit_notifications "Mission completed successfully."
PUBLISH lifekit_notifications "Complete today's journal."

FLUSHDB