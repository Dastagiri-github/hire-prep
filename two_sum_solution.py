def two_sum(nums, target):
    """
    Two Sum Solution - CodeChef Style
    This function expects input in the format that matches the test cases
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

# Alternative solution that works with string input parsing
def main():
    """
    This function handles CodeChef style input from stdin
    Expected input format: "nums = [2,7,11,15], target = 9"
    """
    import sys
    import re
    
    # Read input from stdin
    input_data = sys.stdin.read().strip()
    
    # Parse the input using regex
    nums_match = re.search(r'nums\s*=\s*\[(.*?)\]', input_data)
    target_match = re.search(r'target\s*=\s*(\d+)', input_data)
    
    if nums_match and target_match:
        # Extract numbers
        nums_str = nums_match.group(1)
        nums = [int(x.strip()) for x in nums_str.split(',') if x.strip()]
        
        # Extract target
        target = int(target_match.group(1))
        
        # Call the main function
        result = two_sum(nums, target)
        print(result)
    else:
        # Fallback: try simple JSON parsing
        try:
            import json
            data = json.loads(input_data)
            if isinstance(data, dict):
                nums = data.get('nums', [])
                target = data.get('target', 0)
                result = two_sum(nums, target)
                print(result)
            elif isinstance(data, list):
                # Assume format [nums, target]
                if len(data) >= 2:
                    nums = data[0]
                    target = data[1]
                    result = two_sum(nums, target)
                    print(result)
        except:
            print("[]")

if __name__ == "__main__":
    main()
