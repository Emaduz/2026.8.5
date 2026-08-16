# Scroll restoration validation

The desktop previews for `/` and `/portfolio` render without layout regressions after adding the route scroll manager. The active navigation state remains correct, the portrait composition remains intact, and the page structure is unchanged. The implementation uses manual browser scroll restoration, saves the previous route's `scrollY`, scrolls new push navigations to `0`, and restores the stored position for `popstate` Back navigation.
