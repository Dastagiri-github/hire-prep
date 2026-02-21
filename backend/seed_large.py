import random

import models
from database import SessionLocal, engine

# Ensure tables exist
models.Base.metadata.create_all(bind=engine)


def get_companies():
    tier1 = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix"]
    tier2 = ["Uber", "Airbnb", "LinkedIn", "Twitter", "Salesforce"]
    tier3 = ["TCS", "Infosys", "Wipro", "Accenture", "Cognizant"]

    # Return a random selection of 1-3 companies
    return random.sample(tier1 + tier2 + tier3, k=random.randint(1, 3))


def seed_large_db():
    db = SessionLocal()

    # Clear existing problems to avoid duplicates or just check
    # db.query(models.Problem).delete()
    # db.commit()

    existing_titles = {p.title for p in db.query(models.Problem).all()}

    problems_data = [
        # --- ARRAYS & HASHING ---
        (
            "Two Sum",
            "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
            "Easy",
            ["Array", "Hash Table"],
        ),
        (
            "Contains Duplicate",
            "Given an integer array nums, return true if any value appears at least twice in the array, and return false if every element is distinct.",
            "Easy",
            ["Array", "Hash Table"],
        ),
        (
            "Best Time to Buy and Sell Stock",
            "You are given an array prices where prices[i] is the price of a given stock on the ith day. Return the maximum profit you can achieve.",
            "Easy",
            ["Array", "DP"],
        ),
        (
            "Product of Array Except Self",
            "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].",
            "Medium",
            ["Array"],
        ),
        (
            "Maximum Subarray",
            "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
            "Medium",
            ["Array", "DP"],
        ),
        (
            "Maximum Product Subarray",
            "Given an integer array nums, find a subarray that has the largest product, and return the product.",
            "Medium",
            ["Array", "DP"],
        ),
        (
            "Find Minimum in Rotated Sorted Array",
            "Given the sorted rotated array nums of unique elements, return the minimum element of this array.",
            "Medium",
            ["Array", "Binary Search"],
        ),
        (
            "Search in Rotated Sorted Array",
            "Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not in nums.",
            "Medium",
            ["Array", "Binary Search"],
        ),
        (
            "3Sum",
            "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
            "Medium",
            ["Array", "Two Pointers"],
        ),
        (
            "Container With Most Water",
            "You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]). Find two lines that together with the x-axis form a container, such that the container contains the most water.",
            "Medium",
            ["Array", "Two Pointers"],
        ),
        (
            "Sliding Window Maximum",
            "You are given an array of integers nums, there is a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Return the max sliding window.",
            "Hard",
            ["Array", "Sliding Window"],
        ),
        (
            "Merge Intervals",
            "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.",
            "Medium",
            ["Array", "Sorting"],
        ),
        (
            "Insert Interval",
            "You are given an array of non-overlapping intervals intervals where intervals[i] = [starti, endi] represent the start and the end of the ith interval and intervals is sorted in ascending order by starti.",
            "Medium",
            ["Array"],
        ),
        (
            "Non-overlapping Intervals",
            "Given an array of intervals intervals where intervals[i] = [starti, endi], return the minimum number of intervals you need to remove to make the rest of the intervals non-overlapping.",
            "Medium",
            ["Array", "Greedy"],
        ),
        (
            "Meeting Rooms II",
            "Given an array of meeting time intervals consisting of start and end times [[s1,e1],[s2,e2],...] (si < ei), find the minimum number of conference rooms required.",
            "Medium",
            ["Array", "Heap"],
        ),
        # --- STRINGS ---
        (
            "Valid Anagram",
            "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
            "Easy",
            ["String", "Hash Table"],
        ),
        (
            "Valid Parentheses",
            "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
            "Easy",
            ["String", "Stack"],
        ),
        (
            "Valid Palindrome",
            "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
            "Easy",
            ["String", "Two Pointers"],
        ),
        (
            "Longest Substring Without Repeating Characters",
            "Given a string s, find the length of the longest substring without repeating characters.",
            "Medium",
            ["String", "Sliding Window"],
        ),
        (
            "Longest Repeating Character Replacement",
            "You are given a string s and an integer k. You can choose any character of the string and change it to any other uppercase English character. You can perform this operation at most k times.",
            "Medium",
            ["String", "Sliding Window"],
        ),
        (
            "Group Anagrams",
            "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
            "Medium",
            ["String", "Hash Table"],
        ),
        (
            "Longest Palindromic Substring",
            "Given a string s, return the longest palindromic substring in s.",
            "Medium",
            ["String", "DP"],
        ),
        (
            "Palindromic Substrings",
            "Given a string s, return the number of palindromic substrings in it.",
            "Medium",
            ["String", "DP"],
        ),
        (
            "Encode and Decode Strings",
            "Design an algorithm to encode a list of strings to a string. The encoded string is then sent over the network and is decoded back to the original list of strings.",
            "Medium",
            ["String"],
        ),
        (
            "Minimum Window Substring",
            "Given two strings s and t of lengths m and n respectively, return the minimum window substring of s such that every character in t (including duplicates) is included in the window.",
            "Hard",
            ["String", "Sliding Window"],
        ),
        # --- LINKED LIST ---
        (
            "Reverse Linked List",
            "Given the head of a singly linked list, reverse the list, and return the reversed list.",
            "Easy",
            ["Linked List"],
        ),
        (
            "Merge Two Sorted Lists",
            "You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.",
            "Easy",
            ["Linked List"],
        ),
        (
            "Reorder List",
            "You are given the head of a singly linked-list. The list can be represented as: L0 → L1 → … → Ln - 1 → Ln. Reorder the list to be on the following form: L0 → Ln → L1 → Ln - 1 → L2 → Ln - 2 → …",
            "Medium",
            ["Linked List"],
        ),
        (
            "Remove Nth Node From End of List",
            "Given the head of a linked list, remove the nth node from the end of the list and return its head.",
            "Medium",
            ["Linked List"],
        ),
        (
            "Linked List Cycle",
            "Given head, the head of a linked list, determine if the linked list has a cycle in it.",
            "Easy",
            ["Linked List"],
        ),
        (
            "Merge k Sorted Lists",
            "You are given an array of k linked-lists lists, each linked-list is sorted in ascending order. Merge all the linked-lists into one sorted linked-list and return it.",
            "Hard",
            ["Linked List", "Heap"],
        ),
        (
            "Reverse Nodes in k-Group",
            "Given the head of a linked list, reverse the nodes of the list k at a time, and return the modified list.",
            "Hard",
            ["Linked List"],
        ),
        # --- TREES ---
        (
            "Invert Binary Tree",
            "Given the root of a binary tree, invert the tree, and return its root.",
            "Easy",
            ["Tree", "DFS"],
        ),
        (
            "Maximum Depth of Binary Tree",
            "Given the root of a binary tree, return its maximum depth.",
            "Easy",
            ["Tree", "DFS"],
        ),
        (
            "Same Tree",
            "Given the roots of two binary trees p and q, write a function to check if they are the same or not.",
            "Easy",
            ["Tree", "DFS"],
        ),
        (
            "Subtree of Another Tree",
            "Given the roots of two binary trees root and subRoot, return true if there is a subtree of root with the same structure and node values of subRoot and false otherwise.",
            "Easy",
            ["Tree", "DFS"],
        ),
        (
            "Lowest Common Ancestor of a Binary Search Tree",
            "Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes in the BST.",
            "Medium",
            ["Tree", "BST"],
        ),
        (
            "Binary Tree Level Order Traversal",
            "Given the root of a binary tree, return the level order traversal of its nodes' values.",
            "Medium",
            ["Tree", "BFS"],
        ),
        (
            "Validate Binary Search Tree",
            "Given the root of a binary tree, determine if it is a valid binary search tree (BST).",
            "Medium",
            ["Tree", "BST"],
        ),
        (
            "Kth Smallest Element in a BST",
            "Given the root of a binary search tree, and an integer k, return the kth smallest value (1-indexed) of all the values of the nodes in the tree.",
            "Medium",
            ["Tree", "BST"],
        ),
        (
            "Construct Binary Tree from Preorder and Inorder Traversal",
            "Given two integer arrays preorder and inorder where preorder is the preorder traversal of a binary tree and inorder is the inorder traversal of the same tree, construct and return the binary tree.",
            "Medium",
            ["Tree"],
        ),
        (
            "Binary Tree Maximum Path Sum",
            "A path in a binary tree is a sequence of nodes where each pair of adjacent nodes in the sequence has an edge connecting them. Return the maximum path sum.",
            "Hard",
            ["Tree", "DFS"],
        ),
        (
            "Serialize and Deserialize Binary Tree",
            "Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer.",
            "Hard",
            ["Tree", "Design"],
        ),
        # --- DYNAMIC PROGRAMMING ---
        (
            "Climbing Stairs",
            "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
            "Easy",
            ["DP"],
        ),
        (
            "Coin Change",
            "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount.",
            "Medium",
            ["DP"],
        ),
        (
            "Longest Increasing Subsequence",
            "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
            "Medium",
            ["DP"],
        ),
        (
            "Longest Common Subsequence",
            "Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.",
            "Medium",
            ["DP"],
        ),
        (
            "Word Break",
            "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
            "Medium",
            ["DP"],
        ),
        (
            "Combination Sum",
            "Given an array of distinct integers candidates and a target integer target, return a list of all unique combinations of candidates where the chosen numbers sum to target.",
            "Medium",
            ["DP", "Backtracking"],
        ),
        (
            "House Robber",
            "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed, the only constraint stopping you is that adjacent houses have security systems connected.",
            "Medium",
            ["DP"],
        ),
        (
            "House Robber II",
            "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. All houses at this place are arranged in a circle.",
            "Medium",
            ["DP"],
        ),
        (
            "Decode Ways",
            "A message containing letters from A-Z can be encoded into numbers using the following mapping: 'A' -> '1', 'B' -> '2', ... 'Z' -> '26'.",
            "Medium",
            ["DP"],
        ),
        (
            "Unique Paths",
            "There is a robot on an m x n grid. The robot is initially located at the top-left corner (i.e., grid[0][0]). The robot tries to move to the bottom-right corner (i.e., grid[m - 1][n - 1]).",
            "Medium",
            ["DP"],
        ),
        (
            "Jump Game",
            "You are given an integer array nums. You are initially positioned at the array's first index, and each element in the array represents your maximum jump length at that position.",
            "Medium",
            ["DP", "Greedy"],
        ),
        # --- GRAPHS ---
        (
            "Number of Islands",
            "Given an m x n 2D binary grid grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
            "Medium",
            ["Graph", "BFS", "DFS"],
        ),
        (
            "Clone Graph",
            "Given a reference of a node in a connected undirected graph. Return a deep copy (clone) of the graph.",
            "Medium",
            ["Graph", "DFS"],
        ),
        (
            "Pacific Atlantic Water Flow",
            "There is an m x n rectangular island that borders both the Pacific Ocean and Atlantic Ocean. Return a list of grid coordinates result where result[i] = [ri, ci] denotes that rain water can flow from cell (ri, ci) to both the Pacific and Atlantic oceans.",
            "Medium",
            ["Graph", "DFS"],
        ),
        (
            "Course Schedule",
            "There are a total of numCourses courses you have to take, labeled from 0 to numCourses - 1. You are given an array prerequisites where prerequisites[i] = [ai, bi] indicates that you must take course bi first if you want to take course ai.",
            "Medium",
            ["Graph", "Topological Sort"],
        ),
        (
            "Graph Valid Tree",
            "You have a graph of n nodes labeled from 0 to n - 1. You are given an integer n and a list of edges where edges[i] = [ai, bi] indicates that there is an undirected edge between nodes ai and bi in the graph.",
            "Medium",
            ["Graph", "Union Find"],
        ),
        (
            "Number of Connected Components in an Undirected Graph",
            "You have a graph of n nodes. You are given an integer n and an array edges where edges[i] = [ai, bi] indicates that there is an edge between ai and bi in the graph.",
            "Medium",
            ["Graph", "Union Find"],
        ),
        (
            "Alien Dictionary",
            "There is a new alien language that uses the English alphabet. However, the order among the letters is unknown to you.",
            "Hard",
            ["Graph", "Topological Sort"],
        ),
        # --- HEAP / INTERVAL ---
        (
            "Top K Frequent Elements",
            "Given an integer array nums and an integer k, return the k most frequent elements. You may return the answer in any order.",
            "Medium",
            ["Heap"],
        ),
        (
            "Find Median from Data Stream",
            "The median is the middle value in an ordered integer list. If the size of the list is even, there is no middle value, and the median is the mean of the two middle values.",
            "Hard",
            ["Heap", "Design"],
        ),
        # --- BIT MANIPULATION ---
        (
            "Sum of Two Integers",
            "Given two integers a and b, return the sum of the two integers without using the operators + and -.",
            "Medium",
            ["Bit Manipulation"],
        ),
        (
            "Number of 1 Bits",
            "Write a function that takes an unsigned integer and returns the number of '1' bits it has (also known as the Hamming weight).",
            "Easy",
            ["Bit Manipulation"],
        ),
        (
            "Counting Bits",
            "Given an integer n, return an array ans of length n + 1 such that for each i (0 <= i <= n), ans[i] is the number of 1's in the binary representation of i.",
            "Easy",
            ["Bit Manipulation"],
        ),
        (
            "Missing Number",
            "Given an array nums containing n distinct numbers in the range [0, n], return the only number in the range that is missing from the array.",
            "Easy",
            ["Bit Manipulation"],
        ),
        (
            "Reverse Bits",
            "Reverse bits of a given 32 bits unsigned integer.",
            "Easy",
            ["Bit Manipulation"],
        ),
    ]

    # Generate more variations to reach 100+
    # We will create variations of existing problems with slightly different contexts

    base_problems = list(problems_data)

    # Add 50 more variations
    for i in range(55):
        base_idx = i % len(base_problems)
        original = base_problems[base_idx]

        new_title = f"{original[0]} (Variation {i+1})"
        new_desc = f"Variation of {original[0]}: {original[1]} Consider edge cases with larger inputs."

        problems_data.append((new_title, new_desc, original[2], original[3]))

    count = 0
    for title, desc, diff, tags in problems_data:
        if title in existing_titles:
            continue

        # Generate random sample test cases
        sample_tc = [
            {
                "input": "Sample Input 1",
                "output": "Sample Output 1",
                "explanation": "Explanation 1",
            },
            {
                "input": "Sample Input 2",
                "output": "Sample Output 2",
                "explanation": "Explanation 2",
            },
        ]

        test_cases_map = {
            "Two Sum": [
                {
                    "input": "nums = [2,7,11,15], target = 9",
                    "output": "[0,1]",
                    "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1].",
                },
                {
                    "input": "nums = [3,2,4], target = 6",
                    "output": "[1,2]",
                    "explanation": "3 + 3 is not allowed, so we pick 2 and 4.",
                },
            ],
            "Contains Duplicate": [
                {
                    "input": "nums = [1,2,3,1]",
                    "output": "true",
                    "explanation": "1 appears twice.",
                },
                {
                    "input": "nums = [1,2,3,4]",
                    "output": "false",
                    "explanation": "All elements are distinct.",
                },
            ],
            "Best Time to Buy and Sell Stock": [
                {
                    "input": "prices = [7,1,5,3,6,4]",
                    "output": "5",
                    "explanation": "Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.",
                },
                {
                    "input": "prices = [7,6,4,3,1]",
                    "output": "0",
                    "explanation": "In this case, no transactions are done and the max profit = 0.",
                },
            ],
            "Product of Array Except Self": [
                {
                    "input": "nums = [1,2,3,4]",
                    "output": "[24,12,8,6]",
                    "explanation": "",
                },
                {
                    "input": "nums = [-1,1,0,-3,3]",
                    "output": "[0,0,9,0,0]",
                    "explanation": "",
                },
            ],
            "Maximum Subarray": [
                {
                    "input": "nums = [-2,1,-3,4,-1,2,1,-5,4]",
                    "output": "6",
                    "explanation": "The subarray [4,-1,2,1] has the largest sum 6.",
                },
                {
                    "input": "nums = [1]",
                    "output": "1",
                    "explanation": "The subarray [1] has the largest sum 1.",
                },
            ],
            "Maximum Product Subarray": [
                {
                    "input": "nums = [2,3,-2,4]",
                    "output": "6",
                    "explanation": "[2,3] has the largest product 6.",
                },
                {
                    "input": "nums = [-2,0,-1]",
                    "output": "0",
                    "explanation": "The result cannot be 2, because [-2,-1] is not a subarray.",
                },
            ],
            "Find Minimum in Rotated Sorted Array": [
                {
                    "input": "nums = [3,4,5,1,2]",
                    "output": "1",
                    "explanation": "The original array was [1,2,3,4,5] rotated 3 times.",
                },
                {"input": "nums = [4,5,6,7,0,1,2]", "output": "0", "explanation": ""},
            ],
            "Search in Rotated Sorted Array": [
                {
                    "input": "nums = [4,5,6,7,0,1,2], target = 0",
                    "output": "4",
                    "explanation": "",
                },
                {
                    "input": "nums = [4,5,6,7,0,1,2], target = 3",
                    "output": "-1",
                    "explanation": "",
                },
            ],
            "3Sum": [
                {
                    "input": "nums = [-1,0,1,2,-1,-4]",
                    "output": "[[-1,-1,2],[-1,0,1]]",
                    "explanation": "Notice that the order of the output and the order of the triplets does not matter.",
                },
                {
                    "input": "nums = [0,1,1]",
                    "output": "[]",
                    "explanation": "The only possible triplet does not sum up to 0.",
                },
            ],
            "Container With Most Water": [
                {
                    "input": "height = [1,8,6,2,5,4,8,3,7]",
                    "output": "49",
                    "explanation": "The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.",
                },
                {"input": "height = [1,1]", "output": "1", "explanation": ""},
            ],
            "Sliding Window Maximum": [
                {
                    "input": "nums = [1,3,-1,-3,5,3,6,7], k = 3",
                    "output": "[3,3,5,5,6,7]",
                    "explanation": "Window position                Max\n---------------               -----\n[1  3  -1] -3  5  3  6  7       3\n 1 [3  -1  -3] 5  3  6  7       3\n 1  3 [-1  -3  5] 3  6  7       5\n 1  3  -1 [-3  5  3] 6  7       5\n 1  3  -1  -3 [5  3  6] 7       6\n 1  3  -1  -3  5 [3  6  7]      7",
                },
                {"input": "nums = [1], k = 1", "output": "[1]", "explanation": ""},
            ],
            "Merge Intervals": [
                {
                    "input": "intervals = [[1,3],[2,6],[8,10],[15,18]]",
                    "output": "[[1,6],[8,10],[15,18]]",
                    "explanation": "Since intervals [1,3] and [2,6] overlap, merge them into [1,6].",
                },
                {
                    "input": "intervals = [[1,4],[4,5]]",
                    "output": "[[1,5]]",
                    "explanation": "Intervals [1,4] and [4,5] are considered overlapping.",
                },
            ],
            "Insert Interval": [
                {
                    "input": "intervals = [[1,3],[6,9]], newInterval = [2,5]",
                    "output": "[[1,5],[6,9]]",
                    "explanation": "",
                },
                {
                    "input": "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]",
                    "output": "[[1,2],[3,10],[12,16]]",
                    "explanation": "Because the new interval [4,8] overlaps with [3,5],[6,7],[8,10].",
                },
            ],
            "Non-overlapping Intervals": [
                {
                    "input": "intervals = [[1,2],[2,3],[3,4],[1,3]]",
                    "output": "1",
                    "explanation": "[1,3] can be removed and the rest of the intervals are non-overlapping.",
                },
                {
                    "input": "intervals = [[1,2],[1,2],[1,2]]",
                    "output": "2",
                    "explanation": "You need to remove two [1,2] to make the rest of the intervals non-overlapping.",
                },
            ],
            "Meeting Rooms II": [
                {
                    "input": "intervals = [[0,30],[5,10],[15,20]]",
                    "output": "2",
                    "explanation": "",
                },
                {
                    "input": "intervals = [[7,10],[2,4]]",
                    "output": "1",
                    "explanation": "",
                },
            ],
            "Valid Anagram": [
                {
                    "input": 's = "anagram", t = "nagaram"',
                    "output": "true",
                    "explanation": "",
                },
                {"input": 's = "rat", t = "car"', "output": "false", "explanation": ""},
            ],
            "Valid Parentheses": [
                {"input": 's = "()[]{}"', "output": "true", "explanation": ""},
                {"input": 's = "(]"', "output": "false", "explanation": ""},
            ],
            "Valid Palindrome": [
                {
                    "input": 's = "A man, a plan, a canal: Panama"',
                    "output": "true",
                    "explanation": '"amanaplanacanalpanama" is a palindrome.',
                },
                {
                    "input": 's = "race a car"',
                    "output": "false",
                    "explanation": '"raceacar" is not a palindrome.',
                },
            ],
            "Longest Substring Without Repeating Characters": [
                {
                    "input": 's = "abcabcbb"',
                    "output": "3",
                    "explanation": 'The answer is "abc", with the length of 3.',
                },
                {
                    "input": 's = "bbbbb"',
                    "output": "1",
                    "explanation": 'The answer is "b", with the length of 1.',
                },
            ],
            "Longest Repeating Character Replacement": [
                {
                    "input": 's = "ABAB", k = 2',
                    "output": "4",
                    "explanation": "Replace the two 'A's with two 'B's or vice versa.",
                },
                {
                    "input": 's = "AABABBA", k = 1',
                    "output": "4",
                    "explanation": "Replace the one 'A' in the middle with 'B' and form \"AABBBBA\". The substring \"BBBB\" has the longest repeating letters, which is 4.",
                },
            ],
            "Group Anagrams": [
                {
                    "input": 'strs = ["eat","tea","tan","ate","nat","bat"]',
                    "output": '[["bat"],["nat","tan"],["ate","eat","tea"]]',
                    "explanation": "",
                },
                {"input": 'strs = [""]', "output": '[[""]]', "explanation": ""},
            ],
            "Longest Palindromic Substring": [
                {
                    "input": 's = "babad"',
                    "output": '"bab"',
                    "explanation": '"aba" is also a valid answer.',
                },
                {"input": 's = "cbbd"', "output": '"bb"', "explanation": ""},
            ],
            "Palindromic Substrings": [
                {
                    "input": 's = "abc"',
                    "output": "3",
                    "explanation": 'Three palindromic strings: "a", "b", "c".',
                },
                {
                    "input": 's = "aaa"',
                    "output": "6",
                    "explanation": 'Six palindromic strings: "a", "a", "a", "aa", "aa", "aaa".',
                },
            ],
            "Encode and Decode Strings": [
                {
                    "input": 'strs = ["lint","code","love","you"]',
                    "output": '["lint","code","love","you"]',
                    "explanation": 'One possible encoding is "4#lint4#code4#love3#you".',
                },
                {
                    "input": 'strs = ["we", "say", ":", "yes"]',
                    "output": '["we", "say", ":", "yes"]',
                    "explanation": "",
                },
            ],
            "Minimum Window Substring": [
                {
                    "input": 's = "ADOBECODEBANC", t = "ABC"',
                    "output": '"BANC"',
                    "explanation": "The minimum window substring \"BANC\" includes 'A', 'B', and 'C' from string t.",
                },
                {"input": 's = "a", t = "a"', "output": '"a"', "explanation": ""},
            ],
            "Reverse Linked List": [
                {
                    "input": "head = [1,2,3,4,5]",
                    "output": "[5,4,3,2,1]",
                    "explanation": "",
                },
                {"input": "head = [1,2]", "output": "[2,1]", "explanation": ""},
            ],
            "Merge Two Sorted Lists": [
                {
                    "input": "list1 = [1,2,4], list2 = [1,3,4]",
                    "output": "[1,1,2,3,4,4]",
                    "explanation": "",
                },
                {"input": "list1 = [], list2 = []", "output": "[]", "explanation": ""},
            ],
            "Reorder List": [
                {"input": "head = [1,2,3,4]", "output": "[1,4,2,3]", "explanation": ""},
                {
                    "input": "head = [1,2,3,4,5]",
                    "output": "[1,5,2,4,3]",
                    "explanation": "",
                },
            ],
            "Remove Nth Node From End of List": [
                {
                    "input": "head = [1,2,3,4,5], n = 2",
                    "output": "[1,2,3,5]",
                    "explanation": "",
                },
                {"input": "head = [1], n = 1", "output": "[]", "explanation": ""},
            ],
            "Linked List Cycle": [
                {
                    "input": "head = [3,2,0,-4], pos = 1",
                    "output": "true",
                    "explanation": "There is a cycle in the linked list, where the tail connects to the 1st node (0-indexed).",
                },
                {
                    "input": "head = [1], pos = -1",
                    "output": "false",
                    "explanation": "There is no cycle in the linked list.",
                },
            ],
            "Merge k Sorted Lists": [
                {
                    "input": "lists = [[1,4,5],[1,3,4],[2,6]]",
                    "output": "[1,1,2,3,4,4,5,6]",
                    "explanation": "The linked-lists are:\n[\n  1->4->5,\n  1->3->4,\n  2->6\n]\nmerging them into one sorted list:\n1->1->2->3->4->4->5->6",
                },
                {"input": "lists = []", "output": "[]", "explanation": ""},
            ],
            "Reverse Nodes in k-Group": [
                {
                    "input": "head = [1,2,3,4,5], k = 2",
                    "output": "[2,1,4,3,5]",
                    "explanation": "",
                },
                {
                    "input": "head = [1,2,3,4,5], k = 3",
                    "output": "[3,2,1,4,5]",
                    "explanation": "",
                },
            ],
            "Invert Binary Tree": [
                {
                    "input": "root = [4,2,7,1,3,6,9]",
                    "output": "[4,7,2,9,6,3,1]",
                    "explanation": "",
                },
                {"input": "root = [2,1,3]", "output": "[2,3,1]", "explanation": ""},
            ],
            "Maximum Depth of Binary Tree": [
                {
                    "input": "root = [3,9,20,null,null,15,7]",
                    "output": "3",
                    "explanation": "",
                },
                {"input": "root = [1,null,2]", "output": "2", "explanation": ""},
            ],
            "Same Tree": [
                {
                    "input": "p = [1,2,3], q = [1,2,3]",
                    "output": "true",
                    "explanation": "",
                },
                {
                    "input": "p = [1,2], q = [1,null,2]",
                    "output": "false",
                    "explanation": "",
                },
            ],
            "Subtree of Another Tree": [
                {
                    "input": "root = [3,4,5,1,2], subRoot = [4,1,2]",
                    "output": "true",
                    "explanation": "",
                },
                {
                    "input": "root = [3,4,5,1,2,null,null,null,null,0], subRoot = [4,1,2]",
                    "output": "false",
                    "explanation": "",
                },
            ],
            "Lowest Common Ancestor of a Binary Search Tree": [
                {
                    "input": "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8",
                    "output": "6",
                    "explanation": "The LCA of nodes 2 and 8 is 6.",
                },
                {
                    "input": "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4",
                    "output": "2",
                    "explanation": "The LCA of nodes 2 and 4 is 2, since a node can be a descendant of itself according to the LCA definition.",
                },
            ],
            "Binary Tree Level Order Traversal": [
                {
                    "input": "root = [3,9,20,null,null,15,7]",
                    "output": "[[3],[9,20],[15,7]]",
                    "explanation": "",
                },
                {"input": "root = [1]", "output": "[[1]]", "explanation": ""},
            ],
            "Validate Binary Search Tree": [
                {"input": "root = [2,1,3]", "output": "true", "explanation": ""},
                {
                    "input": "root = [5,1,4,null,null,3,6]",
                    "output": "false",
                    "explanation": "The root node's value is 5 but its right child's value is 4.",
                },
            ],
            "Kth Smallest Element in a BST": [
                {
                    "input": "root = [3,1,4,null,2], k = 1",
                    "output": "1",
                    "explanation": "",
                },
                {
                    "input": "root = [5,3,6,2,4,null,null,1], k = 3",
                    "output": "3",
                    "explanation": "",
                },
            ],
            "Construct Binary Tree from Preorder and Inorder Traversal": [
                {
                    "input": "preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]",
                    "output": "[3,9,20,null,null,15,7]",
                    "explanation": "",
                },
                {
                    "input": "preorder = [-1], inorder = [-1]",
                    "output": "[-1]",
                    "explanation": "",
                },
            ],
            "Binary Tree Maximum Path Sum": [
                {
                    "input": "root = [1,2,3]",
                    "output": "6",
                    "explanation": "The optimal path is 2 -> 1 -> 3 with a path sum of 2 + 1 + 3 = 6.",
                },
                {
                    "input": "root = [-10,9,20,null,null,15,7]",
                    "output": "42",
                    "explanation": "The optimal path is 15 -> 20 -> 7 with a path sum of 15 + 20 + 7 = 42.",
                },
            ],
            "Serialize and Deserialize Binary Tree": [
                {
                    "input": "root = [1,2,3,null,null,4,5]",
                    "output": "[1,2,3,null,null,4,5]",
                    "explanation": "",
                },
                {"input": "root = []", "output": "[]", "explanation": ""},
            ],
            "Climbing Stairs": [
                {
                    "input": "n = 2",
                    "output": "2",
                    "explanation": "There are two ways to climb to the top.\n1. 1 step + 1 step\n2. 2 steps",
                },
                {
                    "input": "n = 3",
                    "output": "3",
                    "explanation": "There are three ways to climb to the top.\n1. 1 step + 1 step + 1 step\n2. 1 step + 2 steps\n3. 2 steps + 1 step",
                },
            ],
            "Coin Change": [
                {
                    "input": "coins = [1,2,5], amount = 11",
                    "output": "3",
                    "explanation": "11 = 5 + 5 + 1",
                },
                {"input": "coins = [2], amount = 3", "output": "-1", "explanation": ""},
            ],
            "Longest Increasing Subsequence": [
                {
                    "input": "nums = [10,9,2,5,3,7,101,18]",
                    "output": "4",
                    "explanation": "The longest increasing subsequence is [2,3,7,101], therefore the length is 4.",
                },
                {"input": "nums = [0,1,0,3,2,3]", "output": "4", "explanation": ""},
            ],
            "Longest Common Subsequence": [
                {
                    "input": 'text1 = "abcde", text2 = "ace"',
                    "output": "3",
                    "explanation": 'The longest common subsequence is "ace" and its length is 3.',
                },
                {
                    "input": 'text1 = "abc", text2 = "abc"',
                    "output": "3",
                    "explanation": 'The longest common subsequence is "abc" and its length is 3.',
                },
            ],
            "Word Break": [
                {
                    "input": 's = "leetcode", wordDict = ["leet","code"]',
                    "output": "true",
                    "explanation": 'Return true because "leetcode" can be segmented as "leet code".',
                },
                {
                    "input": 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]',
                    "output": "false",
                    "explanation": "",
                },
            ],
            "Combination Sum": [
                {
                    "input": "candidates = [2,3,6,7], target = 7",
                    "output": "[[2,2,3],[7]]",
                    "explanation": "2 and 3 are candidates, and 2 + 2 + 3 = 7. Note that 2 can be used multiple times.\n7 is a candidate, and 7 = 7.\nThese are the only two combinations.",
                },
                {
                    "input": "candidates = [2,3,5], target = 8",
                    "output": "[[2,2,2,2],[2,3,3],[3,5]]",
                    "explanation": "",
                },
            ],
            "House Robber": [
                {
                    "input": "nums = [1,2,3,1]",
                    "output": "4",
                    "explanation": "Rob house 1 (money = 1) and then rob house 3 (money = 3).\nTotal amount you can rob = 1 + 3 = 4.",
                },
                {
                    "input": "nums = [2,7,9,3,1]",
                    "output": "12",
                    "explanation": "Rob house 1 (money = 2), rob house 3 (money = 9) and rob house 5 (money = 1).\nTotal amount you can rob = 2 + 9 + 1 = 12.",
                },
            ],
            "House Robber II": [
                {
                    "input": "nums = [2,3,2]",
                    "output": "3",
                    "explanation": "You cannot rob house 1 (money = 2) and then rob house 3 (money = 2), because they are adjacent houses.",
                },
                {
                    "input": "nums = [1,2,3,1]",
                    "output": "4",
                    "explanation": "Rob house 1 (money = 1) and then rob house 3 (money = 3).\nTotal amount you can rob = 1 + 3 = 4.",
                },
            ],
            "Decode Ways": [
                {
                    "input": 's = "12"',
                    "output": "2",
                    "explanation": '"12" could be decoded as "AB" (1 2) or "L" (12).',
                },
                {
                    "input": 's = "226"',
                    "output": "3",
                    "explanation": '"226" could be decoded as "BZ" (2 26), "VF" (22 6), or "BBF" (2 2 6).',
                },
            ],
            "Unique Paths": [
                {"input": "m = 3, n = 7", "output": "28", "explanation": ""},
                {
                    "input": "m = 3, n = 2",
                    "output": "3",
                    "explanation": "From the top-left corner, there are a total of 3 ways to reach the bottom-right corner:\n1. Right -> Down -> Down\n2. Down -> Down -> Right\n3. Down -> Right -> Down",
                },
            ],
            "Jump Game": [
                {
                    "input": "nums = [2,3,1,1,4]",
                    "output": "true",
                    "explanation": "Jump 1 step from index 0 to 1, then 3 steps to the last index.",
                },
                {
                    "input": "nums = [3,2,1,0,4]",
                    "output": "false",
                    "explanation": "You will always arrive at index 3 no matter what. Its maximum jump length is 0, which makes it impossible to reach the last index.",
                },
            ],
            "Number of Islands": [
                {
                    "input": 'grid = [\n  ["1","1","1","1","0"],\n  ["1","1","0","1","0"],\n  ["1","1","0","0","0"],\n  ["0","0","0","0","0"]\n]',
                    "output": "1",
                    "explanation": "",
                },
                {
                    "input": 'grid = [\n  ["1","1","0","0","0"],\n  ["1","1","0","0","0"],\n  ["0","0","1","0","0"],\n  ["0","0","0","1","1"]\n]',
                    "output": "3",
                    "explanation": "",
                },
            ],
            "Clone Graph": [
                {
                    "input": "adjList = [[2,4],[1,3],[2,4],[1,3]]",
                    "output": "[[2,4],[1,3],[2,4],[1,3]]",
                    "explanation": "There are 4 nodes in the graph.\n1st node (val = 1)'s neighbors are 2nd node (val = 2) and 4th node (val = 4).\n2nd node (val = 2)'s neighbors are 1st node (val = 1) and 3rd node (val = 3).\n3rd node (val = 3)'s neighbors are 2nd node (val = 2) and 4th node (val = 4).\n4th node (val = 4)'s neighbors are 1st node (val = 1) and 3rd node (val = 3).",
                },
                {
                    "input": "adjList = [[]]",
                    "output": "[[]]",
                    "explanation": "Note that the input contains one empty list. The graph consists of only one node with val = 1 and it does not have any neighbors.",
                },
            ],
            "Pacific Atlantic Water Flow": [
                {
                    "input": "heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,5],[5,1,1,2,4]]",
                    "output": "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]",
                    "explanation": "",
                },
                {"input": "heights = [[1]]", "output": "[[0,0]]", "explanation": ""},
            ],
            "Course Schedule": [
                {
                    "input": "numCourses = 2, prerequisites = [[1,0]]",
                    "output": "true",
                    "explanation": "There are a total of 2 courses to take. To take course 1 you should have finished course 0. So it is possible.",
                },
                {
                    "input": "numCourses = 2, prerequisites = [[1,0],[0,1]]",
                    "output": "false",
                    "explanation": "There are a total of 2 courses to take. To take course 1 you should have finished course 0, and to take course 0 you should also have finished course 1. So it is impossible.",
                },
            ],
            "Graph Valid Tree": [
                {
                    "input": "n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]",
                    "output": "true",
                    "explanation": "",
                },
                {
                    "input": "n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]",
                    "output": "false",
                    "explanation": "",
                },
            ],
            "Number of Connected Components in an Undirected Graph": [
                {
                    "input": "n = 5, edges = [[0,1],[1,2],[3,4]]",
                    "output": "2",
                    "explanation": "",
                },
                {
                    "input": "n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]",
                    "output": "1",
                    "explanation": "",
                },
            ],
            "Alien Dictionary": [
                {
                    "input": 'words = ["wrt","wrf","er","ett","rftt"]',
                    "output": '"wertf"',
                    "explanation": "",
                },
                {"input": 'words = ["z","x"]', "output": '"zx"', "explanation": ""},
            ],
            "Top K Frequent Elements": [
                {
                    "input": "nums = [1,1,1,2,2,3], k = 2",
                    "output": "[1,2]",
                    "explanation": "",
                },
                {"input": "nums = [1], k = 1", "output": "[1]", "explanation": ""},
            ],
            "Find Median from Data Stream": [
                {
                    "input": '["MedianFinder", "addNum", "addNum", "findMedian", "addNum", "findMedian"]\n[[], [1], [2], [], [3], []]',
                    "output": "[null, null, null, 1.5, null, 2.0]",
                    "explanation": "MedianFinder medianFinder = new MedianFinder();\nmedianFinder.addNum(1);    // arr = [1]\nmedianFinder.addNum(2);    // arr = [1, 2]\nmedianFinder.findMedian(); // return 1.5 (i.e., (1 + 2) / 2)\nmedianFinder.addNum(3);    // arr[1, 2, 3]\nmedianFinder.findMedian(); // return 2.0",
                }
            ],
            "Sum of Two Integers": [
                {"input": "a = 1, b = 2", "output": "3", "explanation": ""},
                {"input": "a = 2, b = 3", "output": "5", "explanation": ""},
            ],
            "Number of 1 Bits": [
                {
                    "input": "n = 11",
                    "output": "3",
                    "explanation": "The input binary string 00000000000000000000000000001011 has a total of three '1' bits.",
                },
                {
                    "input": "n = 128",
                    "output": "1",
                    "explanation": "The input binary string 00000000000000000000000010000000 has a total of one '1' bit.",
                },
            ],
            "Counting Bits": [
                {
                    "input": "n = 2",
                    "output": "[0,1,1]",
                    "explanation": "0 --> 0\n1 --> 1\n2 --> 10",
                },
                {
                    "input": "n = 5",
                    "output": "[0,1,1,2,1,2]",
                    "explanation": "0 --> 0\n1 --> 1\n2 --> 10\n3 --> 11\n4 --> 100\n5 --> 101",
                },
            ],
            "Missing Number": [
                {
                    "input": "nums = [3,0,1]",
                    "output": "2",
                    "explanation": "n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number in the range since it does not appear in nums.",
                },
                {
                    "input": "nums = [0,1]",
                    "output": "2",
                    "explanation": "n = 2 since there are 2 numbers, so all numbers are in the range [0,2]. 2 is the missing number in the range since it does not appear in nums.",
                },
            ],
            "Reverse Bits": [
                {
                    "input": "n = 00000010100101000001111010011100",
                    "output": "964176192 (00111001011110000010100101000000)",
                    "explanation": "The input binary string 00000010100101000001111010011100 represents the unsigned integer 43261596, so return 964176192 which its binary representation is 00111001011110000010100101000000.",
                }
            ],
        }

        if title in test_cases_map:
            sample_tc = test_cases_map[title]

        problem = models.Problem(
            title=title,
            description=desc,
            difficulty=diff,
            tags=tags,
            companies=get_companies(),
            sample_test_cases=sample_tc,
            hidden_test_cases=[],
        )
        db.add(problem)
        count += 1

    db.commit()
    print(f"Successfully added {count} new problems to the database!")
    db.close()


if __name__ == "__main__":
    seed_large_db()
