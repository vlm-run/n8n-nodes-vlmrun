# Development Guide

This guide contains instructions for setting up and developing the n8n-nodes-vlmrun package.

## Prerequisites

You need the following installed on your development machine:

- [git](https://git-scm.com/downloads)
- Node.js and pnpm. Minimum version Node 18. You can find instructions on how to install both using nvm (Node Version Manager) for Linux, Mac, and WSL [here](https://github.com/nvm-sh/nvm). For Windows users, refer to Microsoft's guide to [Install NodeJS on Windows](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows).
- Install n8n with:
  ```
  pnpm install n8n -g
  ```
- Recommended: follow n8n's guide to [set up your development environment](https://docs.n8n.io/integrations/creating-nodes/build/node-development-environment/).

## Using this starter

These are the basic steps for working with the starter. For detailed guidance on creating and publishing nodes, refer to the [documentation](https://docs.n8n.io/integrations/creating-nodes/).

1. Clone the repository:
   ```
   git clone git@github.com:vlm-run/n8n-nodes-vlmrun.git
   ```
2. Run `pnpm i` to install dependencies.
3. Open the project in your editor.
4. Browse the examples in `/nodes` and `/credentials`. Modify the examples, or replace them with your own nodes.
5. Update the `package.json` to match your details.
6. Run `pnpm lint` to check for errors or `pnpm lintfix` to automatically fix errors when possible.
7. Test your node locally. Refer to [Run your node locally](https://docs.n8n.io/integrations/creating-nodes/test/run-node-locally/) for guidance.

```
export VLMRUN_API_BASE_URL='https://api.vlm.run/v1'
echo $VLMRUN_API_BASE_URL
(n8n-nodes-vlmrun)
pnpm run build
pnpm link --global

n8n
cd ~/.n8n
mkdir custom
cd custom
pnpm init
pnpm link --global @vlm-run/n8n-nodes-vlmrun

(restart n8n)
n8n
(search for VlmRun)
```

## Publish

To release a new version, create a new tag with the format `v<version>` and push it to the repository -

```sh
git tag v2.2.0
git push origin v2.2.0
```

Delete tag

```sh
git tag
git tag -d <tag_name>
git push origin --delete <tag-name>
```

## More information

Refer to our [documentation on creating nodes](https://docs.n8n.io/integrations/creating-nodes/) for detailed information on building your own nodes.
