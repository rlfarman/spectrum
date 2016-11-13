import { firebaseDatabase } from './firebase';


export function push(value, path) {
  return new Promise((resolve, reject) => {
    firebaseDatabase.ref(path)
                    .push(value, error => error ? reject(error) : resolve());
  });
}

export function remove(key, path) {
  return new Promise((resolve, reject) => {
    firebaseDatabase.ref(`${path}/${key}`)
                    .remove(error => error ? reject(error) : resolve());
  });
}

export function set(key, value, path) {
  return new Promise((resolve, reject) => {
    firebaseDatabase.ref(`${path}/${key}`)
                    .set(value, error => error ? reject(error) : resolve());
  });
}

export function update(key, value) {
  return new Promise((resolve, reject) => {
    firebaseDatabase.ref(`${this.path}/${key}`)
                    .update(value, error => error ? reject(error) : resolve());
  });
}

export function subscribe(emit, actions, path) {
  let ref = firebaseDatabase.ref(path);
  let initialized = false;
  let list = [];

  ref.once('value', () => {
    initialized = true;
    emit(actions.onLoad(list));
  });

  ref.on('child_added', (snapshot) => {
    if (initialized) {
      emit(actions.onAdd(unwrapSnapshot(snapshot)));
    } else {
      list.push(unwrapSnapshot(snapshot));
    }
  });

  ref.on('child_changed', (snapshot) => {
    emit(actions.onChange(unwrapSnapshot(snapshot)));
  });

  ref.on('child_removed', (snapshot) => {
    emit(actions.onRemove(unwrapSnapshot(snapshot)));
  });
}

export function unwrapSnapshot(snapshot) {
  let attrs = snapshot.val();
  attrs.key = snapshot.key;
  return attrs;
}
