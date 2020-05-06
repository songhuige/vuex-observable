
import { Subject } from 'rxjs'

export function observableAction(init) {
  const input$ = new Subject();
  const action$ = input$.asObservable();

  let $output
  return function observableAction(context, payload) {
    if (!$output) {
      $output = init(action$, context)
    }
    input$.next(payload)
    return $output
  }
}
