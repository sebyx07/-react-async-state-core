InMemoryStorage# InMemoryStorage

An in-memory storage utility with auto-cleaning, max element constraints, and expiration functionality.

## Table of Contents

- [Constructor](#constructor)
- [Methods](#methods)
    - [set](#set)
    - [get](#get)
    - [remove](#remove)
    - [clear](#clear)
    - [stopAutoCleaning](#stopautocleaning)
- [Example](#example)

## Constructor

```typescript
constructor(maxElements: number, expirationTime: number)
```

- `maxElements`: Maximum number of elements the storage can hold.
- `expirationTime`: Time (in milliseconds) after which an item expires and is eligible for cleaning.

### Methods

#### set
Stores a value in the storage.
```typescript
set(key: string, value: T): void
```

Parameters:

- key: The key to identify the stored value.
- value: The value to be store

#### get
Retrieve a value from the storage.

```typescript
get(key: string): T | undefined
```
Parameters:

- key: The key associated with the value to retrieve.
- Returns:
  - The value associated with the provided key or undefined if not found or expired.

#### remove
Removes a specific value from the storage.

```typescript
remove(key: string): void
```
Parameters:

- key: The key associated with the value to remove.


#### clear
Removes all values from the storage.

```typescript
clear(): void
```

#### stopAutoCleaning
Stops the auto-cleaning process.

```typescript
stopAutoCleaning(): void
```
Example
```typescript
const storage = new InMemoryStorage<string>(10, 60000);  // max 10 items, 1-minute expiration

// Store a value
storage.set('name', 'Alice');

// Retrieve a value
const value = storage.get('name');  // Alice

// Remove a value
storage.remove('name');

// Clear the storage
storage.clear();

// Stop auto-cleaning
storage.stopAutoCleaning();
```
