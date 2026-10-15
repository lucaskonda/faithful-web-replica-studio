<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Preserve the imported website markup and original compiled semantic-token stylesheet as the presentation source; this avoids changing the supplied design during migration.
- Keep browser interactions in the home route with delegated handlers for the imported markup; this restores original filters, FAQ accordion, and mobile navigation without duplicating content.
- Store imported media as Lovable Assets pointers so original images and video remain available without binary files in the repository.
- Exclude third-party preview branding and tracking scripts from imported page markup; they belong to the original host rather than the customer's website.
