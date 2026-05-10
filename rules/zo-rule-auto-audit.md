# Zo Rule: Auto-Audit Every Response
# Create this rule in Zo Settings -> Rules

CONDITION: always

AFTER EVERY RESPONSE you produce, invoke the audit_membrane MCP tool with:
- text: your complete last response
- phase: the current 5QLN phase you are in

If the audit returns corruption flags:
1. Name the corruption code(s) and meaning in your next reply
2. Apply the recovery prompt
3. Continue the session from recovered state

Never skip the audit. The membrane watches every exchange.
