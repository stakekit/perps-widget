import { Atom } from "@effect-atom/atom-react";
import { type Duration, Effect, Schedule } from "effect";
import { dual } from "effect/Function";

export const withRefreshAfter = dual<
  (refreshAfter: Duration.Duration) => <A>(atom: Atom.Atom<A>) => Atom.Atom<A>,
  <A>(atom: Atom.Atom<A>, refreshAfter: Duration.Duration) => Atom.Atom<A>
>(2, (atom, refreshAfter) => {
  return Atom.transform(atom, (ctx) => {
    const cancelRefresh = Effect.sleep(refreshAfter).pipe(
      Effect.andThen(Effect.sync(() => ctx.refresh(atom))),
      Effect.repeat({
        schedule: Schedule.forever.pipe(Schedule.addDelay(() => refreshAfter)),
      }),
      Effect.runCallback,
    );

    ctx.addFinalizer(cancelRefresh);

    return ctx.get(atom);
  });
});
