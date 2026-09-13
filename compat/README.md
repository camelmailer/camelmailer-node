# compat/

Packages published from this repository under a different name, kept here so
they are versioned and findable rather than living in someone's temp folder.

## `camelmailer/`

The unscoped name `camelmailer` on npm. It re-exports `@camelmailer/sdk`
unchanged, so code written against the old name keeps working, and it is
published as deprecated so anyone installing it is pointed at the new name.
Holding the name also keeps it from being taken by someone else, which for a
package that carries sending credentials is worth the 860 bytes.

It is **not** part of the SDK build: `files` in the root manifest ships only
`dist`, and tsconfig, vitest and eslint all skip this directory. It has no
release workflow either, because it changes roughly never.

To publish a new version of it:

```bash
cd compat/camelmailer
# bump "version" first; npm never lets a name@version be reused
npm publish --access public
npm deprecate camelmailer "Moved to @camelmailer/sdk. This version re-exports it unchanged, so existing code keeps working."
```
