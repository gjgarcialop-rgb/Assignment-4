// these are the DOM elements we will interact with
const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const message = document.getElementById('message');
const gallery = document.querySelector('.gallery');

// this function will search for TV shows based on the query
async function searchShow(query) {
    gallery.replaceChildren();
    message.textContent = 'Loading...';


// start of the try block for fetching TV shows
    try {
        const response = await fetch(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);

        if (response.status === 429) {
            throw new Error('Too many requests. Please try again later.');
        }

        if (!response.ok) {
            throw new Error('Failed to load shows. Please try again later.');
        }


        // parse the JSON response and extract the shows
        const results = await response.json();
        const shows = results.slice(0, 10);

        if (shows.length === 0) {
            message.textContent = 'No shows found.';
            return;
        }

        message.textContent = '';


        // create and append cards for each show
        for (const result of shows) {
            const show = result.show;
            const card = document.createElement('div');
            card.className = 'card';

            // add the show's image if available
            if (show.image?.medium) {
                const img = document.createElement('img');
                img.src = show.image.medium;
                img.alt = `${show.name} poster`;
                card.appendChild(img);
            }

            const name = document.createElement('h2');
            name.textContent = show.name || 'Not Available';
            card.appendChild(name);

            // add the show's summary
            const summary = document.createElement('p');

            if (show.summary) {
                const parsedSummary = new DOMParser().parseFromString(
                    show.summary,
                    'text/html'
                );

                summary.textContent =
                    parsedSummary.body.textContent.trim() || 'Not Available';
            } else {
                summary.textContent = 'Not Available';
            }

            card.appendChild(summary);

            const premiere = document.createElement('p');
            premiere.textContent = `Premiere Date: ${show.premiered || 'Not Available'}`;
            card.appendChild(premiere);

            const updated = document.createElement('p');

            if (show.updated) {
                updated.textContent = `Last Updated: ${new Date(show.updated * 1000).toLocaleString()}`;
            } else {
                updated.textContent = 'Last Updated: Not Available';
            }

            card.appendChild(updated);

            const genres = document.createElement('p');
            genres.textContent = `Genres: ${show.genres?.length ? show.genres.join(', ') : 'Not Available'}`;
            card.appendChild(genres);

            const rating = document.createElement('p');
            rating.textContent = `Rating: ${show.rating?.average ?? 'Not Available'}`;
            card.appendChild(rating);

            const castTitle = document.createElement('h3');
            castTitle.textContent = 'Cast:';
            card.appendChild(castTitle);

            const castList = document.createElement('ul');

            try {
                const castResponse = await fetch(`https://api.tvmaze.com/shows/${show.id}/cast`);

                if (!castResponse.ok) {
                    throw new Error('Cast request failed');
                }

                const cast = await castResponse.json();

                cast.slice(0, 5).forEach(member => {
                    const item = document.createElement('li');
                    item.textContent = member.person?.name || 'Not Available';
                    castList.appendChild(item);
                });
            } catch {
                // Display the fallback below if the cast request fails.
            }

            if (castList.children.length === 0) {
                const item = document.createElement('li');
                item.textContent = 'Not Available';
                castList.appendChild(item);
            }

            card.appendChild(castList);

            const link = document.createElement('a');
            link.href = show.url;
            link.textContent = 'More Info';
            link.target = '_blank';
            link.rel = 'noopener';
            card.appendChild(link);

            gallery.appendChild(card);
        }

    } catch (error) {
        gallery.replaceChildren();
        message.textContent = error.message;
    }

}

// handle the search form
form.addEventListener('submit', function (event) {
    event.preventDefault();

    const query = input.value.trim();

    if (query === '') {
        gallery.replaceChildren();
        message.textContent = 'Please enter a search query.';
        return;
    }

    searchShow(query);

});

// load a default search when the page opens
searchShow('girls');