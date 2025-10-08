# NX Monorepo Setup Instructions
This project uses an NX monorepo to manage both the Expo Go React Native frontend and the Python backend.

## Initial Setup (with Directory Structure Note)

1. **Create the NX workspace:**
	```sh
	npx create-nx-workspace@latest multiagenetic-healthcare
    Please note this will create the folder 'multiagenetic-healthcare' inside the folder you have chosen.
	```
	- Choose `None` for the preset (TypeScript/JavaScript monorepo).
	- Choose TypeScript as the default language.

2. **Add Expo Go React Native app:**
	```sh
	npm install --save-dev @nx/expo
	npx nx g @nx/expo:app mobile
	```
	- **Note:** In recent NX versions, the generated app (e.g., `mobile`) is placed directly in the root of your workspace, not under an `apps/` folder. This is expected and follows the new flat structure convention. If you want to use the classic `apps/` folder, you can manually move the generated app into `apps/mobile` and update your NX configuration accordingly. However, the flat structure is fully supported and recommended by NX.

3. **Add backend folder for Python:**
	```sh
	mkdir python_backend
	```
	- Place your Python backend code in the `python_backend` folder at the root. This allows you to add other backend folders later (e.g., `spring_backend` for a Java/Spring backend) and keeps each backend isolated. (If you prefer, you can use `apps/python_backend` for a classic structure, but this is optional.)

4. **(Optional) Add a libs folder for shared code:**
	```sh
	mkdir packages
	```
	- NX now often uses `packages/` for shared libraries, but `libs/` is also fine.

5. **Commit your changes:**
	```sh
	git add .
	git commit -m "Initialize NX monorepo with Expo Go frontend and backend folder"
	```

**Directory Issue Note:**

If you expected to see an `apps/` folder, but only see `mobile/` in the root, this is normal for the latest NX versions. The workspace uses a flat structure by default. Your `mobile` app and any other apps or packages will appear at the root level unless you manually organize them into folders like `apps/` or `packages/`.

You can now develop your Expo Go app in `mobile/` and your Python backend in `python_backend/` (or `apps/python_backend` if you created it that way). If you add a Spring backend, you might use a folder like `spring_backend/`.
# MultiageneticHealthcare

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is almost ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/nx-api/js?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

## Finish your remote caching setup

[Click here to finish setting up your workspace!](https://cloud.nx.app/connect/5I5bYnoVAM)


## Generate a library

```sh
npx nx g @nx/js:lib packages/pkg1 --publishable --importPath=@my-org/pkg1
```

## Run tasks

To build the library use:

```sh
npx nx build pkg1
```

To run any task with Nx use:

```sh
npx nx <target> <project-name>
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Versioning and releasing

To version and release the library use

```
npx nx release
```

Pass `--dry-run` to see what would happen without actually releasing the library.

[Learn more about Nx release &raquo;](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Keep TypeScript project references up to date

Nx automatically updates TypeScript [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) in `tsconfig.json` files to ensure they remain accurate based on your project dependencies (`import` or `require` statements). This sync is automatically done when running tasks such as `build` or `typecheck`, which require updated references to function correctly.

To manually trigger the process to sync the project graph dependencies information to the TypeScript project references, run the following command:

```sh
npx nx sync
```

You can enforce that the TypeScript project references are always in the correct state when running in CI by adding a step to your CI job configuration that runs the following command:

```sh
npx nx sync:check
```

[Learn more about nx sync](https://nx.dev/reference/nx-commands#sync)


[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/nx-api/js?utm_source=nx_project&amp;utm_medium=readme&amp;utm_campaign=nx_projects)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Releasing Packages with Nx release](https://nx.dev/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
