# Meteora DLMM Batch Operations

This toolkit now supports batch operations for claiming and closing multiple positions at once, improving efficiency and reducing transaction costs.

## New Actions

### claimFromMultiplePositions

Claim accumulated trading fees and protocol rewards from multiple positions without closing them.

**Parameters:**
- `positions` (array, required): Array of position objects
  - `lbPair` (string): The DLMM pool address
  - `position` (string): The position public key

**Example:**
```typescript
const result = await claimFromMultiplePositions({
  positions: [
    {
      lbPair: "pool_address_1",
      position: "position_key_1"
    },
    {
      lbPair: "pool_address_2", 
      position: "position_key_2"
    }
  ]
});
```

### claimAndCloseMultiplePositions

Claim accumulated rewards and close multiple positions in a single transaction.

**Parameters:**
- `positions` (array, required): Array of position objects
  - `lbPair` (string): The DLMM pool address
  - `position` (string): The position public key
- `claimRewards` (boolean, optional): Whether to claim rewards before closing (default: true)

**Example:**
```typescript
const result = await claimAndCloseMultiplePositions({
  positions: [
    {
      lbPair: "pool_address_1",
      position: "position_key_1"
    },
    {
      lbPair: "pool_address_2",
      position: "position_key_2"
    }
  ],
  claimRewards: true
});
```

## Benefits

- **Gas Efficiency**: Process multiple positions in a single transaction
- **Time Savings**: Reduce the number of individual transactions required
- **Better UX**: Simplify position management for users with multiple positions
- **Cost Reduction**: Lower overall transaction fees compared to individual operations

## Usage Tips

1. Use `getDlmmPoolPositionsByUser` first to get all user positions
2. Filter positions based on your criteria (e.g., unclaimed rewards > threshold)
3. Use batch operations to efficiently claim and/or close selected positions
4. Always verify position addresses before executing batch operations