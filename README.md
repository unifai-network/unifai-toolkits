# Unifai Network Toolkits

Official toolkits for Unifai Network - an AI-native platform enabling dynamic tools and seamless agent-to-agent communication.

## Getting Started

To build or use toolkits, check out our SDKs:

- [JavaScript/TypeScript SDK](https://github.com/unifai-network/unifai-sdk-js)
- [Python SDK](https://github.com/unifai-network/unifai-sdk-py)

## Contributing

We welcome contributions! Here's how you can help:

1. Create your toolkit in the `toolkits` directory
2. Test thoroughly with popular LLM models like GPT 4o, Claude, etc.
3. Submit a Pull Request with:
   - Example chat conversations showing your toolkit in action
   - Any known limitations or requirements

Your toolkit should be:
- Self-contained and independent
- Well-tested with major LLM providers
- Following best practices for code quality

Python toolkits in this repository should be runnable using `uv run .` inside the toolkit directory.

JavaScript toolkits should be runnable using `npm start` inside the toolkit directory.
