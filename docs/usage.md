# NS MCP usage notes

## Ask tool

Use the `ask_ns` tool with a natural-language question.

### Example

```json
{
  "name": "ask_ns",
  "arguments": {
    "query": "What trains depart from Utrecht Centraal in the next hour?"
  }
}
```

## Supported question types

- disruptions / delays
- departures
- arrivals
- station information
- fares and pricing
- travel advice and route planning

## Notes

This tool calls the official NS API and summarizes the result for the agent to use in a natural-language answer.
