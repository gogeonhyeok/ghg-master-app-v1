# Physics notebook

Visit `/physics`, also listed in the home page project list and command palette.
The root layout supplies the shared app bar and dark/light toggle. `page.tsx`
sets route metadata; `PhysicsLab.tsx` owns browser-only experiments. Tag selectors
in `page.module.css` are isolated by the module's `main#physicsPage` ID.
No external API, keys, chart package or database is required.

Five experiments use analytical models in `models.ts`:

- Projectile motion: speed, angle, gravity and time scrubber; optional playback.
  Uniform gravity, no drag, level launch and landing. Axes remain fixed for each
  gravity setting, covering every permitted launch. Playback ends at landing.
- Electrostatics: two point charges in vacuum. Field-vector directions are
  superposed and normalised; arrows do not encode field strength. Force is
  computed in SI units from microcoulomb inputs. This is the static electric
  limit of electromagnetism, not a magnetic-field or Maxwell-equation solver.
- Special relativity: Lorentz factor, proper time during 10 laboratory seconds,
  and length contraction of a rod with 100 m rest length. Inertial frames only.
- General relativity: stationary Schwarzschild clock rate at r > rₛ, relative
  to infinity. Spherical, non-rotating, uncharged source. No geodesic integration.
- Statistical physics: three-dimensional Maxwell–Boltzmann speed density for a
  dilute ideal gas, with molar mass in kg/mol. Dashed curve: 300 K reference.
  Temperature axes stay fixed per species. Density is plotted in 10⁻³ s/m.

Sliders, selects, named sections and plot summaries are keyboard/screen-reader
accessible. Plots scroll horizontally on narrow screens to keep axis labels legible.
Animation is opt-in; there is no automatic or looping animation.
Every section includes expandable assumptions and an educational reference.

References:
[Projectile motion](https://openstax.org/books/university-physics-volume-1/pages/4-3-projectile-motion),
[Coulomb's law](https://openstax.org/books/university-physics-volume-2/pages/5-3-coulombs-law),
[time dilation](https://openstax.org/books/university-physics-volume-3/pages/5-3-time-dilation),
[general relativity](https://openstax.org/books/university-physics-volume-1/pages/13-7-einsteins-theory-of-gravity),
[Schwarzschild clock rates](https://ctqm.colorado.edu/~ajsh/courses/bh/schwp.html),
[molecular speed distributions](https://openstax.org/books/university-physics-volume-2/pages/2-4-distribution-of-molecular-speeds).

Run `npm test -- --runInBand --watchman=false app/physics` for physical limiting
cases, normalisation and control interactions.
