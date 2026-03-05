def two_sum(nums, target):
    """
    Two Sum Solution - Function Only
    Users only need to write this function logic
    Test cases are handled by the system automatically
    """
    # Create a hash map to store value -> index mapping
    num_map = {}
    
    for i, num in enumerate(nums):
        complement = target - num
        
        # Check if complement exists in our map
        if complement in num_map:
            return [num_map[complement], i]
        
        # Store current number with its index
        num_map[num] = i
    
    # If no solution found, return empty list
    return []
