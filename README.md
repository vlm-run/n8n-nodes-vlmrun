<div align="center">
<p align="center" style="width: 100%;">
    <img src="https://raw.githubusercontent.com/vlm-run/.github/refs/heads/main/profile/assets/vlm-black.svg" alt="VLM Run Logo" width="80" style="margin-bottom: -5px; color: #2e3138; vertical-align: middle; padding-right: 5px;"><br>
</p>
<h2>n8n-nodes-vlmrun</h2>
<p align="center">
<a href="https://vlm.run"><b>Website</b></a> | <a href="https://app.vlm.run/"><b>Platform</b></a> | <a href="https://docs.vlm.run/"><b>Docs</b></a> | <a href="https://docs.vlm.run/blog"><b>Blog</b></a> | <a href="https://discord.gg/4jgyECY4rq"><b>Discord</b></a>
</p>
<p align="center">
<a href="https://www.npmjs.com/package/@vlm-run/n8n-nodes-vlmrun"><img alt="NPM Version" src="https://badge.fury.io/js/%40vlm-run%2Fn8n-nodes-vlmrun.svg"></a>
<a href="https://github.com/vlm-run/n8n-nodes-vlmrun/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/vlm-run/n8n-nodes-vlmrun.svg"></a>
<a href="https://discord.gg/4jgyECY4rq"><img alt="Discord" src="https://img.shields.io/badge/discord-chat-purple?color=%235765F2&label=discord&logo=discord"></a>
<a href="https://twitter.com/vlmrun"><img alt="Twitter Follow" src="https://img.shields.io/twitter/follow/vlmrun.svg?style=social&logo=twitter"></a>
</p>
</div>

This is an n8n community node. It lets you use [VLM Run](https://vlm.run) in your n8n workflows.

VLM Run is a unified gateway for Visual AI that enables you to extract structured data from unstructured visual content like images, videos, audio, and documents using Vision Language Models (VLMs).


## 💾 Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

```bash
npm i @vlm-run/n8n-nodes-vlmrun
```

## ⚙️ Operations

- **Analyze Audio**: Analyze audio files for transcription, speaker identification, sentiment analysis, and more.
- **Analyze Document**: Extract structured data from documents such as resumes, invoices, presentations, and more.
- **Analyze Image**: Extract information or generate captions from images.
- **Analyze Video**: Extract insights or transcribe content from video files.
- **Manage Files**: List uploaded files or upload new files to VLM Run.

## 🔑 Credentials

1. Sign up for a VLM Run account at [vlm.run](https://app.vlm.run/)
2. Get your API key from the dashboard
3. Use the API key in the n8n VLM Run node credentials

## 📖 Usage

1. **Configure Credentials**:
   - Add your VLM Run API credentials in n8n
   - Set the API base URL (default: https://api.vlm.run/v1)

2. **Add VLM Run Node**:
   - Search for "VLM Run" in the n8n nodes panel
   - Add it to your workflow

3. **Configure Node**:
   - Select the operation (Analyze Audio, Analyze Document, Analyze Image, Analyze Video, or Manage Files)
   - Provide the required input fields (such as file data, model, or domain)
   - Configure any additional parameters as needed

4. **Run the workflow** to process your visual or audio data with VLM Run's AI models.

## 📸 Screenshots

Here are some screenshots of the n8n-nodes-vlmrun in action:

![VLM Run Node Overview](assets/vlmrun-overview.png)
_Overview of the VLM Run node in n8n_

![VLM Run Workflow Example](assets/vlmrun-workflow.png)
_Example workflow using the VLM Run node_

## 🔗 Resources

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [VLM Run Documentation](https://docs.vlm.run/introduction)
- [VLM Run API Reference](https://docs.vlm.run/api-reference/v1/health)
- [Example Workflows](https://n8n.io/workflows)

## 🛠️ Example Use Cases

- Extracting structured data from resumes, invoices, or utility bills
- Cataloging and captioning product images
- Transcribing and analyzing audio interviews or calls
- Extracting insights from video content
- Managing files in your VLM Run account from n8n workflows

## 📄 License

[Apache-2.0](LICENSE)