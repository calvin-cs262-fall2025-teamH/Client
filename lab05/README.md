Lab05 README responses:

1. Why couldn’t the original app, as implemented before you made the changes in this exercise, delete any items from the list?

     The original app could not make the changes (the deletions), because the program was set up so that the items had been passed down as props, so the child components (the details) could not modify the parent components (the list). So, the delete function was inoperative.

2. What would you do to update this app to allow users to add a new item and to update an existing item? Just explain what you’d do, without giving any code.

    To add a new item, I would need a new "parent" component that would allow me to create a new item and then pass it down to the list component. So, that way, it could add an item to the home page, which would then be able to be deleted in the detials page. To update an existing item, I would add an option in the details page to edit the item, which would then be able to update the item in the list page.

3. Did the old implementation follow the best practices for URL parameters? Does the new version?

    The old implementation did NOT follow the best practices for the URL parameters, because it was passing down an entire object (item) as the parameter, which is not a good practice. The new version DOES follow the best practices, because it only passes down the id of the item.

4. The deleteItem is wrapped by useCallback. What good does this do?
Can what you’ve done in this exercise be seen as refactoring the original app?

    The deleteItem being wrapped in useCallback makes it so that it does not recreate the function every time the component re-renders, which is better for the program's performance. It could be considered as refactoring the entire original app, because by including the wrap, it makes the app more efficient as a whole.
